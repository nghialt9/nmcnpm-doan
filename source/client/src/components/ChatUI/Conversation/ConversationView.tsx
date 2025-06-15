import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

import {
  sendConversation,
  textToSpeechFromServer,
  getConversationByHistoryId,
} from "../../../services/chat";
import { speechToText } from "../../../services/openapi";
import { Message as ChatMessage } from "../../../types/Chat";


// SỬA LỖI: Loại bỏ trạng thái 'PROCESSING' gây rắc rối
type ConversationStatus = "IDLE" | "LISTENING" | "TRANSCRIBING" | "SPEAKING";

interface ConversationViewProps {
  activeHistory: any;
  onExit: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ activeHistory, onExit }) => {
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ConversationStatus>("IDLE");
  const [error, setError] = useState<string | null>(null);

  const statusRef = useRef(status);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const currentBotAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        
        // SỬA LỖI: onstop giờ là trình xử lý chính sau khi ghi âm kết thúc
        recorder.onstop = () => {
          console.log("Recorder.onstop fired.");
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          audioChunksRef.current = [];

          if (audioBlob.size > 1000) {
            // Chuyển sang trạng thái phiên dịch và bắt đầu xử lý
            setStatus("TRANSCRIBING");
            _handleTranscribeAndSend(audioBlob);
          } else {
            // Nếu không có gì để phiên dịch, quay lại nghe
            console.warn("Audio blob was too small. Returning to listening.");
            setStatus("LISTENING");
          }
        };

      } catch (err) {
        console.error("Media initialization failed:", err);
        setError("Could not access the microphone.");
        setStatus("IDLE");
      }
    };
    
    const initialLoad = async () => {
      await initializeMedia();
      if (activeHistory?.history_uuid) {
        const res = await getConversationByHistoryId(activeHistory.history_uuid);
        if (res.success && res.conversations) {
          setTranscript(res.conversations.map((c: any) => ({...c, uuid: c.uuid || uuidv4()})));
        }
      }
      setStatus("LISTENING");
    }

    initialLoad();

    return () => {
        if (mediaRecorderRef.current?.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []); 

  // useEffect giờ chỉ quản lý việc bắt đầu/dừng các hành động chính
  useEffect(() => {
    if (status === "LISTENING") {
        stopSpeaking();
        startRecording();
    } else if (status === "SPEAKING") {
        stopRecording();
        const lastMessage = transcript[transcript.length - 1];
        if (lastMessage?.role === 'system') {
            speakBotMessage(lastMessage);
        }
    }
  }, [status, transcript]);

  
  const startRecording = () => {
    if (mediaRecorderRef.current?.state === "inactive") {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      mediaRecorderRef.current.start();
      console.log("Recording started...");
      detectSilence();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      console.log("stopRecording called, stopping recorder.");
      mediaRecorderRef.current.stop(); // Thao tác này sẽ kích hoạt onstop
    }
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
    }
  };
  
  const stopSpeaking = () => {
      if (currentBotAudioRef.current) {
        currentBotAudioRef.current.pause();
        currentBotAudioRef.current.src = "";
        currentBotAudioRef.current = null;
      }
  };

  // SỬA LỖI: detectSilence gọi thẳng stopRecording()
  const detectSilence = () => {
    const SILENCE_THRESHOLD = 10;
    const SILENCE_DURATION_MS = 1500;
    let silenceStart = Date.now();
    let hasSpoken = false;

    const tick = () => {
        if (statusRef.current !== "LISTENING" || !analyserRef.current) {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
            return;
        };
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

        if (average > SILENCE_THRESHOLD) {
            hasSpoken = true;
            silenceStart = Date.now();
        } else {
            if (hasSpoken && Date.now() - silenceStart > SILENCE_DURATION_MS) {
                console.log("Silence detected. Stopping recording directly.");
                stopRecording(); // Gọi thẳng hàm dừng
                return; 
            }
        }
        animationFrameId.current = requestAnimationFrame(tick);
    }
    tick();
  };
  
  const speakBotMessage = async (message: ChatMessage) => {
    if (!message?.content) {
        setStatus("LISTENING");
        return;
    }
    try {
        const audioUrl = await textToSpeechFromServer(message.content);
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            currentBotAudioRef.current = audio;
            audio.onended = () => setStatus("LISTENING");
            audio.onerror = (e) => {
                console.error("Audio playback error:", e);
                setStatus("LISTENING");
            };
            await audio.play();
        } else {
            setStatus("LISTENING");
        }
    } catch (error) {
        console.error("TTS Error:", error);
        setStatus("LISTENING");
    }
  };

  const _handleTranscribeAndSend = async (audioBlob: Blob) => {
    try {
      const transcribedText = await speechToText(audioBlob);
      if (transcribedText && transcribedText.trim()) {
        await _handleSendTextContent(transcribedText);
      } else {
        console.warn("Transcription was empty. Returning to listening.");
        setStatus("LISTENING");
      }
    } catch (err) {
      setError("Sorry, there was an error transcribing your speech.");
      setStatus("LISTENING");
    }
  };

  const _handleSendTextContent = async (text: string) => {
    const userMsg: ChatMessage = { uuid: uuidv4(), sender: "user", content: text, role: "user" };
    try {
      const res = await sendConversation({
        number_sentence: "1",
        sentences: text,
        history_uuid: activeHistory.history_uuid,
      });
      const botMsg: ChatMessage = {
        uuid: uuidv4(),
        sender: "system",
        content: res.success ? (res.message ?? "An error occurred.") : "An error occurred.",
        role: "system",
      };
      setTranscript((prev) => [...prev, userMsg, botMsg]);
      setStatus("SPEAKING");
    } catch (err) {
      const errorMsg: ChatMessage = {
        uuid: uuidv4(),
        sender: "system",
        content: "A connection error occurred.",
        role: "system",
      };
      setTranscript((prev) => [...prev, userMsg, errorMsg]);
      setStatus("SPEAKING");
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "LISTENING": return "Listening...";
      case "TRANSCRIBING": return "Thinking..."; // Đổi tên cho rõ nghĩa
      case "SPEAKING": return "Replying...";
      case "IDLE": return "Initializing...";
      default: return "";
    }
  }

  return (
    <div className="conversation-overlay">
      <button className="exit-btn" onClick={onExit}> <FaTimes size={24} /> </button>
      <div className="transcript-container">
        {transcript.map((msg) => (
          <p key={msg.uuid} className={`transcript-line ${msg.role === "user" ? "user-text" : "bot-text"}`}>
            <span className="transcript-role">{msg.role === 'user' ? 'You' : 'Bot'}:</span>
            {msg.content}
          </p>
        ))}
      </div>
      <div className="status-footer">
        {error && <div className="error-text">{error}</div>}
        <div className={`status-indicator ${status.toLowerCase()}`}>{getStatusText()}</div>
      </div>
    </div>
  );
};

export default ConversationView;
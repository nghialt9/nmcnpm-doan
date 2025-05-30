import React, { useState, useEffect, useRef, Fragment } from "react";
import { IoSend } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa6";
import { IoMdAddCircle } from "react-icons/io";
import { useAuth } from "../../providers/AuthContext";
import { saveHistories } from "../../services/chat";
import { SubmitConversation, Message } from "../../types/Chat";
import { sendConversation } from "../../services/chat";
import { ListGroup, ListGroupItem, Spinner } from "react-bootstrap";
import { getHistories, getConversationByHistoryId } from "../../services/chat";
import { v4 as uuidv4 } from "uuid";
import { speechToText } from "../../services/openapi";

import UserConversation from "./Conversation/User";
import BotConversation from "./Conversation/Bot";

import "./chatui.css";
import Header from "../Header";

interface ChatProps {}

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];

const Chat: React.FC<ChatProps> = () => {
  const { state } = useAuth();
  const [histories, setHistories] = useState<any[]>([]);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [activeHistory, setActiveHistory] = useState<any>({});
  const [activeDate, setActiveDate] = useState<string>("");
  const [isRecording, setIsRecording] = useState<any>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const inputRef: any = useRef<HTMLInputElement>(null);
  const finalTranscriptRef = useRef<string>('');
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    _initMediaRecorder();
    return () => {
      // Cleanup: stop media stream tracks when component unmounts
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const _initMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store stream for cleanup

      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
        console.log("Audio data available:", event.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("MediaRecorder stopped.");
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Using webm as seen in ondataavailable
        audioChunks = []; // Clear chunks for next recording

        console.log("Audio Blob created:", audioBlob);

        // Send audioBlob to backend for OpenAI transcription
        // For now, let's just log the blob size
        console.log("Audio Blob size:", audioBlob.size, "bytes");

        try {
          // Call the speechToText function with the audio blob
          const transcribedText = await speechToText(audioBlob);

          if (transcribedText !== null) {
            // Set the transcribed text to the input field
            inputRef.current.value = transcribedText;
            console.log("Transcription successful:", transcribedText);
          } else {
            console.error("Transcription returned null.");
            // Optionally display an error to the user
          }
        } catch (error) {
          console.error("Error during transcription process:", error);
          // Optionally display an error to the user
        }
      };

      console.log("MediaRecorder initialized.");
    } catch (error) {
      console.error("Error initializing MediaRecorder or accessing microphone:", error);
      alert("Could not access microphone. Please ensure it is connected and permission is granted.");
    }
  };

  const startRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'inactive') {
      audioChunks = []; // Clear previous chunks
      mediaRecorder.start();
      setIsRecording(true);
      console.log("Recording started.");
    } else if (mediaRecorder && mediaRecorder.state === 'recording') {
       console.log("Already recording.");
    } else if (!mediaRecorder) {
       console.log("MediaRecorder not initialized.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      console.log("Recording stopped.");
    } else if (mediaRecorder && mediaRecorder.state === 'inactive') {
       console.log("Not currently recording.");
    } else if (!mediaRecorder) {
       console.log("MediaRecorder not initialized.");
    }
  };

  useEffect(() => {
    _handleFetchHistories({ uuid: state.user?.uuid });
  }, [state.user?.uuid]);

  useEffect(() => {
    if (activeHistory.history_uuid) {
      _handleFetchConversation(activeHistory.history_uuid);
    }
  }, [activeHistory.history_uuid]);

  useEffect(() => {
    let object: any = document.getElementsByClassName("chats")[0];
    object.scrollTop = object.scrollHeight;
  }, [conversation]);

  const _handleFetchHistories = async ({ uuid }: any) => {
    try {
      const response = await getHistories({ uuid });
      if (response.success && response.data && response.data.length > 0) {
        setHistories(response.data);
        console.log("Fetched histories:", response.data);
        const firstHistory = response.data[0];
        setActiveHistory(firstHistory);
        setActiveDate(firstHistory.createdAt);
      } else {
        setHistories([]);
        setActiveHistory({});
        setActiveDate("");
        setConversation([]);
        console.error("Error fetching histories:", response.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error _handleFetchHistories:", error);
      setHistories([]);
      setActiveHistory({});
      setActiveDate("");
      setConversation([]);
    }
  };

  const _handleFetchConversation = async (history_uuid: string) => {
    try {
      const response = await getConversationByHistoryId(history_uuid);
      if (response.success && response.conversations) {
        setConversation(response.conversations);
      } else {
        console.error("Error fetching conversations:", response.error);
      }
    } catch (error) {
      console.error("Error _handleFetchConversation:", error);
    }
  };

  const _handleSendText = async (event: any) => {
    event.preventDefault();
    const inputText = inputRef.current.value.trim();
    if (!inputText) return;

    // Đảm bảo activeHistory.history_uuid có giá trị trước khi gửi
    if (!activeHistory.history_uuid) {
        console.error("No active history selected. Please select or create a history first.");
        setChatError("Vui lòng chọn hoặc tạo lịch sử chat trước khi gửi tin nhắn."); // Vietnamese message
        setIsLoading(false); // Reset loading state nếu không gửi được
        return;
    }

    // Clear previous chat error if any
    setChatError(null);

    console.log("Sending message for history:", activeHistory);

    let newUserMessage: Message | undefined;

    try {
      setIsLoading(true);
      newUserMessage = {
        uuid: uuidv4(),
        sender: "user",
        content: inputText,
        role: "user",
      };
      setConversation(prevConversation => [...prevConversation, newUserMessage as Message]);
      inputRef.current.value = "";

      const submitConversation: SubmitConversation = {
        number_sentence: "123", // Cần xem lại giá trị này có đúng không
        sentences: inputText,
        history_uuid: activeHistory.history_uuid, // Sử dụng history_uuid từ state đã cập nhật
      };

      const response = await sendConversation(submitConversation);

      if (response.success && response.message) {
        const botMessage: Message = {
          uuid: uuidv4(),
          sender: "system",
          content: response.message,
          role: "system",
        };
        setConversation(prevConversation => [...prevConversation, botMessage]);
        // Sau khi bot trả lời, fetch lại toàn bộ conversation để đồng bộ với DB (Tùy chọn, có thể tối ưu hơn)
        // await _handleFetchConversation(activeHistory.history_uuid);

      } else {
        console.error("Error sending message:", response.error);
        if (newUserMessage) {
          setConversation(prevConversation => prevConversation.filter(msg => msg.uuid !== newUserMessage!.uuid));
        }
      }
    } catch (error) {
      console.error("Error _handleSendText:", error);
      if (newUserMessage) {
        setConversation(prevConversation => prevConversation.filter(msg => msg.uuid !== newUserMessage!.uuid));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const _handleCreateHistory = async () => {
    if (!state?.user?.uuid) {
      console.error("User not logged in or user UUID not available.");
      // Có thể hiển thị thông báo cho người dùng là cần đăng nhập
      return;
    }

    try {
      const response = await saveHistories({
        user_uuid: state.user.uuid, // Sử dụng user.uuid chắc chắn đã có
      });
      if (response.success && response.data) {
        const newHistory = response.data;
        setActiveHistory(newHistory);
        setActiveDate(newHistory.createdAt);
        await _handleFetchHistories({ uuid: state?.user?.uuid });
      } else {
        console.error("Error creating history:", response.error);
      }
    } catch (error) {
      console.error("Error _handleCreateHistory:", error);
    }
  };

  const _handleActivateHistory = (history: any) => {
    setActiveHistory(history);
    setActiveDate(history.createdAt);
  };

  const _handleDisabledCreateNewHistory = () => {
    const today = new Date();
    // Get local date components for today
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth(); // 0-indexed
    const todayDay = today.getDate();

    console.log("Today (Local):", `${todayYear}-${todayMonth + 1}-${todayDay}`);

    // Check if any history entry has a createdAt date matching today's local date
    const exist = histories.find((history) => {
      const historyDate = new Date(history.createdAt);
      // Get local date components for history date
      const historyYear = historyDate.getFullYear();
      const historyMonth = historyDate.getMonth(); // 0-indexed
      const historyDay = historyDate.getDate();

      console.log("History Date (Local):", `${historyYear}-${historyMonth + 1}-${historyDay}`);

      return (
        historyYear === todayYear &&
        historyMonth === todayMonth &&
        historyDay === todayDay
      );
    });

    return !exist;
  };

  return (
    <>
      <Header />
      <div className="App">
        <div className="sidebar">
          <div className="titleSideBar">
            <h1>History</h1>
          </div>
          <div className="top">
            <div className="newChat">
              <IoMdAddCircle size={30} color="white" />
              <button onClick={_handleCreateHistory} disabled={!_handleDisabledCreateNewHistory()}>
                Today
              </button>
            </div>
            <div className="historyList">
              <ListGroup className="list">
                {histories.map((history) => (
                  <ListGroupItem
                    key={history.uuid}
                    active={history.createdAt === activeDate}
                    className="detailList"
                    onClick={() => _handleActivateHistory(history)}
                  >
                    {history?.createdAt}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </div>
          </div>
        </div>
        <div className="chatting">
          <div className="titleMain">
            <h1>Chatting</h1>
          </div>
          <div className="main">
            <div className="chats">
              {conversation.map((msg) => (
                <Fragment key={msg.uuid || msg.content}>
                  {msg.role === "user" ? (
                    <UserConversation content={msg.content} />
                  ) : (
                    <BotConversation content={msg.content} />
                  )}
                </Fragment>
              ))}
            </div>
            <div className="chatFooter">
              <div className="inp">
                <input
                  type="text"
                  ref={inputRef}
                  placeholder="Ask me anything...."
                />
                <button
                  style={{ width: "auto" }}
                  className={`micro ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? (
                    <FaMicrophone size={30} color="blue" />
                  ) : (
                    <FaMicrophone size={30} color="white" />
                  )}
                </button>
                <button className="send" onClick={_handleSendText}>
                  {isLoading ? (
                    <Spinner animation="border" variant="light" size="sm" />
                  ) : (
                    <IoSend size={30} color="white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        {chatError && <div className="chat-error-message">{chatError}</div>}
      </div>
    </>
  );
};

export default Chat;

import React, { useState, useRef, useEffect } from "react";
import { FaVolumeUp, FaSpinner } from "react-icons/fa";
import { textToSpeechFromServer } from "../../services/chat"; 
import "./index.css";

const ButtonSpeaker = ({ text }: { text: string }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();

      if (audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const _handlePlay = async () => {
    // Nếu đang phát, hãy dừng lại
    if (isPlaying && audioRef.current) {
      cleanupAudio();
      return;
    }

    // Dọn dẹp audio cũ trước khi tạo mới
    cleanupAudio();
    setIsPlaying(true);

    try {
      const audioUrl = await textToSpeechFromServer(text);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          cleanupAudio();
        };
        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          cleanupAudio();
        };

        await audio.play();
      } else {
        console.error("Failed to get audio from server.");
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error playing text to speech:", error);
      setIsPlaying(false);
    }
  };

  // Cleanup effect khi component bị unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  return (
    <div>
      <button
        className={`speaker ${isPlaying ? "playing" : ""}`}
        onClick={_handlePlay}
        title={isPlaying ? "Stop" : "Play text to speech"}
        aria-label={isPlaying ? "Stop" : "Play text to speech"}
        disabled={!text}
      >
        <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isPlaying ? <FaSpinner className="spin-animation" color="cadetblue" /> : <FaVolumeUp color="cadetblue" />}
        </div>
      </button>
    </div>
  );
};

export default ButtonSpeaker;
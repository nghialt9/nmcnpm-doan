import { useState, useEffect } from "react";
import { FaVolumeUp } from "react-icons/fa";
import "./index.css";
import React from "react";

const ButtonSpeaker = ({ text }: { text: string }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const synth = window.speechSynthesis;

    return () => {
      synth.cancel();
    };
  }, [text]);

  const _handlePlay = () => {
    setIsPlaying(true);
    let synth = window.speechSynthesis;

    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech synthesis
      synth.cancel();

      // Function to split the text into smaller chunks
      const splitText = (text: any, chunkSize = 100) => {
        // const regex = new RegExp(`.{1,${chunkSize}}(\\s|$)`, "g");
        // return text.match(regex) || [];
        return text.split(".");
      };

      // Split the message into smaller chunks
      const chunks = splitText(text);

      // Create and speak each chunk sequentially
      chunks.forEach((chunk: any, index: any) => {
        const utterance = new SpeechSynthesisUtterance(chunk);

        if (index === chunks.length - 1) {
          utterance.onend = () => {
            console.log("Finished speaking all chunks");
            setIsPlaying(false);
          };
        }

        utterance.onerror = (event) => {
          console.error("SpeechSynthesisUtterance.onerror", event);
        };

        synth.speak(utterance);
      });
    } else {
      alert("Sorry, your browser doesn't support text to speech.");
    }
  };

  return (
    <div>
      <button
        className={`speaker ${!isPlaying ? "" : "pointer"}`}
        onClick={_handlePlay}
      >
        <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaVolumeUp color="cadetblue" />
        </div>
      </button>
    </div>
  );
};

export default ButtonSpeaker;

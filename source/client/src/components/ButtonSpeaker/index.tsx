import { useState, useEffect } from "react";
import { FaVolumeUp } from "react-icons/fa";
import "./index.css";
import React from "react";

const ButtonSpeaker = ({ text }: { text: string }) => {
  const [isPaused, setIsPaused] = useState(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [utterance, setUtterance] = useState<any>(null);

  const [voice, setVoice] = useState<any>(null);
  const [pitch, setPitch] = useState<any>(1);
  const [rate, setRate] = useState<any>(1);
  const [volume, setVolume] = useState<any>(1);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u: any = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();

    setUtterance(u);
    setVoice(voices[0]);

    return () => {
      synth.cancel();
    };
  }, [text]);

  const _handlePlay = () => {
    setIsPlaying(true);
    let synth = window.speechSynthesis;

    // if (isPaused) {
    //   synth.resume();
    // } else {
    //   utterance.voice = voice;
    //   utterance.pitch = pitch;
    //   utterance.rate = rate;
    //   utterance.volume = volume;
    //   synth.speak(utterance);
    // }

    // synth.speak(utterance);

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

  const handlePause = () => {
    const synth = window.speechSynthesis;

    synth.pause();

    setIsPaused(true);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;

    synth.cancel();

    setIsPaused(false);
  };

  const handleVoiceChange = (event: any) => {
    const voices = window.speechSynthesis.getVoices();
    setVoice(voices.find((v) => v.name === event?.target?.value));
  };

  const handlePitchChange = (event: any) => {
    setPitch(parseFloat(event?.target.value));
  };

  const handleRateChange = (event: any) => {
    setRate(parseFloat(event?.target.value));
  };

  const handleVolumeChange = (event: any) => {
    setVolume(parseFloat(event.target.value));
  };

  return (
    <div>
      <div style={{ display: "none" }}>
        <label>
          Voice:
          <select value={voice?.name} onChange={handleVoiceChange}>
            {window.speechSynthesis.getVoices().map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Pitch:
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={handlePitchChange}
          />
        </label>
        <label>
          Speed:
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={handleRateChange}
          />
        </label>
        <br />
        <label>
          Volume:
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
          />
        </label>

        <br />
      </div>
      <button
        className={`speaker ${!isPlaying ? "" : "pointer"}`}
        onClick={_handlePlay}
      >
        <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaVolumeUp color="white" />
        </div>
      </button>
    </div>
  );
};

export default ButtonSpeaker;

import React, { useState, useRef, useEffect } from "react";

interface SoundRecorderProps {
  onRecordingComplete?: (blob: Blob) => void; 
}

const SoundRecorder: React.FC<SoundRecorderProps> = ({
  onRecordingComplete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const recordedAudioRef: any = useRef<Blob | null>(null);
  const animationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {

    if (animationRef.current) {
      animationRef.current.classList.toggle("animate");
    }
  }, [isRecording]);

  const handleStartRecording = async () => {
    setIsRecording(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Browser does not support audio recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        recordedAudioRef.current = audioBlob;
        setIsRecording(false);

        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
      };

      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (isRecording) {
      const mediaRecorder = recordedAudioRef.current?.stop();
      if (mediaRecorder) {
        mediaRecorder.onstop = null; // Detach event listener for cleanup
      }
    }
  };

  return (
    <div className="sound-recorder">
      <button onClick={handleStartRecording} disabled={isRecording}>
        {isRecording ? "Stop Recording" : "Record Sound"}
      </button>
      <button onClick={handleStopRecording}>"Stop Recording"</button>
      <div
        ref={animationRef}
        className={`animation ${isRecording ? "" : "hidden"}`}
      >
        {/* Optional visual feedback (e.g., growing circle) */}
      </div>
    </div>
  );
};

export default SoundRecorder;

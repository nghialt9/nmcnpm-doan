import React, { useState } from "react";
import axios from "axios";

interface SpeechToTextProps {}

const SpeechToText: React.FC<SpeechToTextProps> = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return; // Handle empty file selection
    }
    setAudioFile(file);
    setError(null); // Clear previous error
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      setError("Please select an audio file.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model", "whisper-1");
      formData.append("response_format", "text");

      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`, // Use environment variable for API key
          },
        }
      );

      setTranscription(response.data.text);
    } catch (error: any) {
      console.error(error); // Log the error for debugging
      setError("Transcription failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="audio/mpeg" onChange={handleFileUpload} />
      <button onClick={handleTranscribe} disabled={isLoading}>
        {isLoading ? "Transcribing..." : "Transcribe Audio"}
      </button>
      {transcription && <p>Transcription: {transcription}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default SpeechToText;

import React, { useState, useEffect } from "react";
import { textToSpeech } from "../../services/openapi";
import { TextToSpeechProps } from "../../types/Chat";

const TextToSpeech: React.FC<TextToSpeechProps> = ({ formText }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSpeech = async (formText: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await textToSpeech(formText);
      const blobUrl = URL.createObjectURL(response);
      setAudioUrl(blobUrl);
    } catch (error: any) {
      console.error(error);
      setError("Speech generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cleanup the blob URL when the component unmounts
    return () => URL.revokeObjectURL(audioUrl || "");
  }, [audioUrl]);

  return (
    <div>
      <button onClick={() => generateSpeech(formText)} disabled={isLoading}>
        {isLoading ? "Generating Speech..." : "Generate Speech"}
      </button>
      {audioUrl && (
        <audio src={audioUrl} controls onEnded={() => setAudioUrl(null)} />
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default TextToSpeech;

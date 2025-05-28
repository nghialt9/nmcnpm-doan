import React, { useState } from "react";

import { translate } from "../../services/chat";

const TextSelector: React.FC = () => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);

  const handleMouseUp = async () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      setSelectedText(selectedText);
      const translatedText = await translate(selectedText);
      setTranslation(translatedText);
    }
  };

  const handleSpeak = () => {
    if (translation) {
      const utterance = new SpeechSynthesisUtterance(translation);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div onMouseUp={handleMouseUp}>
      <p>Select some text in this sentence to translate and speak it.</p>
      {selectedText && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            border: "1px solid black",
            padding: "10px",
            backgroundColor: "white",
          }}
        >
          <p>Selected Text: {selectedText}</p>
          <p>Translation: {translation}</p>
          <button onClick={handleSpeak}>Speak</button>
        </div>
      )}
    </div>
  );
};

export default TextSelector;

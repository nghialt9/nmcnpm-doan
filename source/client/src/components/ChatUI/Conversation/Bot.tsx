import React, { useEffect, useState, useRef } from "react";

import "../chatui.css";

import { RiRobot2Fill } from "react-icons/ri";
import { translate } from "../../../services/chat";

import ButtonTranslate from "../../ButtonTranslate";
import ButtonSpeaker from "../../ButtonSpeaker";

function useOutsideAlerter(ref: any, handleClickOutside: any) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function _handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        handleClickOutside();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", _handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", _handleClickOutside);
    };
  }, [ref]);
}

const BotConversation = ({ content }: any) => {
  const [selectedText, setSelectedText] = useState<string | "">("");
  const [translation, setTranslation] = useState<string | null>(null);

  const wrapperRef = useRef<any>(null);

  const handleMouseUp = async () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      setSelectedText(selectedText);
      const { translatedText } = await translate(selectedText);
      setTranslation(translatedText);
    }
  };

  const handleSpeak = () => {
    if (translation) {
      const utterance = new SpeechSynthesisUtterance(selectedText);
      window.speechSynthesis.speak(utterance);
    }
  };

  const _handleClickOutside = () => {
    setSelectedText("");
  };

  useOutsideAlerter(wrapperRef, _handleClickOutside);

  return (
    <div className={`chat bott`} onMouseUp={handleMouseUp}>
      <div style={{ minWidth: "32px" }}>
        <RiRobot2Fill size={30} />
      </div>
      <p className="txt">{content}</p>
      {selectedText && (
        <div
          ref={wrapperRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            border: "1px solid black",
            padding: "10px",
            backgroundColor: "#7ab2b2",
            borderRadius: "8px",
          }}
        >
          <p>Selected Text: {selectedText}</p>
          <p>Translation: {translation}</p>
          <button onClick={handleSpeak}>Speak</button>
        </div>
      )}
      <div className="botFunction">
        <ButtonSpeaker text={content} />
        <ButtonTranslate text={content} />
      </div>
    </div>
  );
};

export default BotConversation;

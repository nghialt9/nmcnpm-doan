import React, { useEffect, useState, useRef, useCallback } from "react";

import "../chatui.css";

import { RiRobot2Fill } from "react-icons/ri";
import { translate } from "../../../services/chat";

import ButtonTranslate from "../../ButtonTranslate";
import ButtonSpeaker from "../../ButtonSpeaker";
import { FaVolumeUp, FaTimes } from "react-icons/fa";

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
  }, [ref, handleClickOutside]);
}

const BotConversation = ({ content }: any) => {
  const [selectedText, setSelectedText] = useState<string | "">("");
  const [translation, setTranslation] = useState<string | null>(null);

  const wrapperRef = useRef<any>(null);

  const handleMouseUp = async (event: React.MouseEvent<HTMLDivElement>) => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      try {
        setSelectedText(selectedText);
        const response = await translate(selectedText);
        if (response.success && response.translatedText) {
          setTranslation(response.translatedText);
        } else {
          console.error("Translation failed:", response.error);
        }
      } catch (error) {
        console.error("Error translating:", error);
      }
    }
  };

  const handleSpeak = () => {
    if (translation) {
      const utterance = new SpeechSynthesisUtterance(selectedText);
      window.speechSynthesis.speak(utterance);
    }
  };

  const _handleClickOutside = useCallback(() => {
    setSelectedText("");
  }, [setSelectedText]);

  useOutsideAlerter(wrapperRef, _handleClickOutside);

  return (
    <div className={`chat bott`} onMouseUp={handleMouseUp}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: "65px" }}>
        <RiRobot2Fill size={30} />
        <span className="bot-label" style={{ marginLeft: '5px' }}>Bot</span>
      </div>
      <p className="txt">{content}</p>
      {selectedText && (
        <div
          ref={wrapperRef}
          className="translation-popup"
        >
          <div className="translation-header">
            <h4>Translation</h4>
            <button className="close-btn" onClick={() => setSelectedText("")}>
              <FaTimes size={16} />
            </button>
          </div>
          <div className="translation-content">
            <div className="translation-item">
              <span className="label">Original:</span>
              <p className="text">{selectedText}</p>
            </div>
            <div className="translation-item">
              <span className="label">Translated:</span>
              <p className="text">{translation}</p>
            </div>
          </div>
          <button className="speak-btn" onClick={handleSpeak}>
            <FaVolumeUp size={16} />
            <span>Speak</span>
          </button>
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

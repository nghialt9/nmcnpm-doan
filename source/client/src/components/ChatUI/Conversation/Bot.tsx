// File: client/src/components/ChatUI/Conversation/Bot.tsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import "../chatui.css";
import { RiRobot2Fill } from "react-icons/ri";
import { translate } from "../../../services/chat";
import ButtonTranslate from "../../ButtonTranslate";
import ButtonSpeaker from "../../ButtonSpeaker";

interface BotConversationProps {
  content: string;
  created_at?: string;
  onSaveWord: (word: string, meaning: string) => void;
}

function useOutsideAlerter(
  ref: React.RefObject<HTMLElement | null>,
  cb: () => void
) {
  useEffect(() => {
    function handle(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) cb();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, cb]);
}

const BotConversation: React.FC<BotConversationProps> = ({ content, created_at, onSaveWord }) => {
  /* ------------------------------ STATE ------------------------------ */
  const [selectedText, setSelectedText] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const popupRef = useRef<HTMLDivElement>(null);

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  /* -------------------------- SELECTION / TRANSLATE ------------------------- */
  const handleMouseUp = async (e: React.MouseEvent<HTMLDivElement>) => {
  if (popupRef.current && popupRef.current.contains(e.target as Node)) return;

  const sel = window.getSelection();
  const text = sel ? sel.toString().trim() : "";
  if (!text || !sel) return;

  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const chatsEl = document.querySelector(".chats");
  const scrollTop = chatsEl?.scrollTop || 0;

  setPopupPos({
    top: rect.bottom + scrollTop + 8,
    left: rect.left + window.scrollX,
  });

  setSelectedText(text);
  setIsTranslating(true);
  try {
    const res = await translate(text);
    setTranslation(res.success ? res.translatedText || "" : "");
  } catch (err) {
    console.error("translate fail", err);
    setTranslation("");
  } finally {
    setIsTranslating(false);
  }
};


  /* ------------------------------ ACTIONS ----------------------------- */
  const clearPopup = useCallback(() => {
    setSelectedText("");
    setTranslation("");
  }, []);

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedText && translation) {
      console.log("SaveWord clicked", { selectedText, translation });
      onSaveWord(selectedText, translation);
      clearPopup();
    }
  };

    const handleSpeak = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  e.stopPropagation();
  // Always speak the original English selection
  if (!selectedText) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(selectedText);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
};


  /* click‑outside */
  useOutsideAlerter(popupRef, clearPopup);

  /* ------------------------------- RENDER ------------------------------ */
  return (
    <div className="chat bott" onMouseUp={handleMouseUp}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 65 }}>
        <RiRobot2Fill size={30} />
        <span className="bot-label" style={{ marginLeft: 5 }}>Bot</span>
      </div>
      <p className="txt">{content}</p>

      {selectedText && (
        <div
          ref={popupRef}
          className="translation-popup"
        >
          <div className="translation-header">
            <h4>Translation</h4>
            <button className="close-btn" onClick={clearPopup}>✖</button>
          </div>

          <div className="translation-content">
            {isTranslating ? (
              <p>Loading…</p>
            ) : (
              <>
                <div className="translation-item">
                  <span className="label">Original:</span>
                  <p className="text">{selectedText}</p>
                </div>
                <div className="translation-item">
                  <span className="label">Translated:</span>
                  <p className="text">{translation}</p>
                </div>
              </>
            )}
          </div>

          <div className="popup-actions">
            <button type="button" className="save-btn" onClick={handleSave} disabled={isTranslating || !translation}>
              Save Word
            </button>
            <button type="button" className="speak-btn" onClick={handleSpeak} disabled={!selectedText}>
              Speak
            </button>
          </div>
        </div>
      )}

      <div className="botFunction">
        <span className="message-time">{formatTime(created_at)}</span>
        <ButtonSpeaker text={content} />
        <ButtonTranslate text={content} />
      </div>
    </div>
  );
};

export default BotConversation;

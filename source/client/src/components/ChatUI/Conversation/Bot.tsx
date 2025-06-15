import React, { useEffect, useState, useRef, useCallback } from "react";
import "../chatui.css";
import { RiRobot2Fill } from "react-icons/ri";
import { translate, textToSpeechFromServer } from "../../../services/chat";
import ButtonTranslate from "../../ButtonTranslate"; 
import ButtonSpeaker from "../../ButtonSpeaker";
interface BotConversationProps {
  content: string;
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
const BotConversation: React.FC<BotConversationProps> = ({ content, onSaveWord }) => {
  /* ------------------------------ STATE & REFS ------------------------------ */
  const [selectedText, setSelectedText] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeakingPopup, setIsSpeakingPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const popupRef = useRef<HTMLDivElement>(null);
  const popupAudioRef = useRef<HTMLAudioElement | null>(null);
  const botMessageRef = useRef<HTMLDivElement>(null); 


  const showTranslationPopup = useCallback(async (textToTranslate: string, baseRect?: DOMRect) => {
    if (!textToTranslate) return;

   
    const rect = baseRect || botMessageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const chatsEl = document.querySelector(".chats");
    const scrollTop = chatsEl?.scrollTop || 0;

    // Đặt vị trí cho popup
    setPopupPos({
      top: rect.bottom + scrollTop + 8,
      left: rect.left + window.scrollX,
    });

    // Bắt đầu dịch
    setSelectedText(textToTranslate);
    setIsTranslating(true);
    try {
      const res = await translate(textToTranslate);
      setTranslation(res.success ? res.translatedText || "" : "Translation failed.");
    } catch (err) {
      console.error("translate fail", err);
      setTranslation("Translation failed due to an error.");
    } finally {
      setIsTranslating(false);
    }
  }, []);

  /* -------------------------- HANDLERS ------------------------- */

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // Không kích hoạt nếu đang click vào popup
    if (popupRef.current && popupRef.current.contains(e.target as Node)) return;

    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : "";
    if (!text || !sel) return;

    // Lấy vị trí từ vùng văn bản được chọn
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Gọi hàm trung tâm với văn bản và vị trí đã chọn
    showTranslationPopup(text, rect);
  };


  const handleTranslateAllClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    // Gọi hàm trung tâm với toàn bộ nội dung tin nhắn
    showTranslationPopup(content);
  };



  const cleanupPopupAudio = useCallback(() => {
    if (popupAudioRef.current) {
      popupAudioRef.current.pause();
      if (popupAudioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(popupAudioRef.current.src);
      }
      popupAudioRef.current = null;
    }
    setIsSpeakingPopup(false);
  }, []);

  const clearPopup = useCallback(() => {
    cleanupPopupAudio();
    setSelectedText("");
    setTranslation("");
  }, [cleanupPopupAudio]);

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedText && translation) {
      onSaveWord(selectedText, translation);
      clearPopup();
    }
  };

  const handleSpeak = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedText || isSpeakingPopup) return;

    setIsSpeakingPopup(true);
    try {
      const audioUrl = await textToSpeechFromServer(selectedText);
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        popupAudioRef.current = audio;
        
        audio.onended = () => cleanupPopupAudio();
        audio.onerror = () => cleanupPopupAudio();
        
        await audio.play();
      } else {
        setIsSpeakingPopup(false);
      }
    } catch (error) {
      console.error("Error handling popup speech:", error);
      setIsSpeakingPopup(false);
    }
  };
  
  useOutsideAlerter(popupRef, clearPopup);

  useEffect(() => {
    return () => cleanupPopupAudio();
  }, [cleanupPopupAudio]);

  /* ------------------------------- RENDER ------------------------------ */
  return (
    // Thêm ref vào div chính
    <div className="chat bott" ref={botMessageRef} onMouseUp={handleMouseUp}>
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
            <button type="button" className="speak-btn" onClick={handleSpeak} disabled={!selectedText || isSpeakingPopup}>
              {isSpeakingPopup ? 'Speaking...' : 'Speak'}
            </button>
          </div>
        </div>
      )}

      <div className="botFunction">
        <ButtonSpeaker text={content} />
        <ButtonTranslate onClick={handleTranslateAllClick} />
      </div>
    </div>
  );
};

export default BotConversation;
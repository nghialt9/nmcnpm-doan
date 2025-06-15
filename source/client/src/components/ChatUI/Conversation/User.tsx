
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { IoPersonSharp } from "react-icons/io5";

import "../chatui.css";
import { useAuth } from "../../../providers/AuthContext";
import { useTranslationPopup } from '../../../hooks/useTranslationPopup';
import TranslationPopup from './TranslationPopup';
import { textToSpeechFromServer } from '../../../services/chat'; // Import service phát âm

interface UserConversationProps {
  content: string;
  onSaveWord: (word: string, meaning: string) => void;
}

const UserConversation: React.FC<UserConversationProps> = ({ content, onSaveWord }) => {
  const { state } = useAuth();
  const conversationRef = useRef<HTMLDivElement>(null);

  // === Thêm logic cho các nút action (giống như trong BotConversation) ===
  const [isSpeakingPopup, setIsSpeakingPopup] = useState<boolean>(false);
  const popupAudioRef = useRef<HTMLAudioElement | null>(null);

  const {
    popupRef,
    selectedText,
    translation,
    isTranslating,
    popupPos,
    showTranslationPopup,
    clearPopup
  } = useTranslationPopup();

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

  const handleFullClear = useCallback(() => {
    clearPopup();
    cleanupPopupAudio();
  }, [clearPopup, cleanupPopupAudio]);

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedText && translation) {
      onSaveWord(selectedText, translation);
      handleFullClear();
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
  
  useEffect(() => {
    return () => cleanupPopupAudio();
  }, [cleanupPopupAudio]);
  // === Kết thúc phần logic thêm vào ===


  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (popupRef.current && popupRef.current.contains(e.target as Node)) return;

    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : "";
    if (!text || !sel) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    showTranslationPopup(text, rect);
  };

  return (
    <>
      <div className={`chat user`} ref={conversationRef} onMouseUp={handleMouseUp}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <IoPersonSharp size={30} />
          {state.user?.username && <span className="user-label" style={{ marginLeft: '5px' }}>{state.user.username}</span>}
        </div>
        <p className="txt">{content}</p>
      </div>

      <TranslationPopup
        ref={popupRef}
        pos={popupPos}
        isTranslating={isTranslating}
        originalText={selectedText}
        translatedText={translation}
        onClose={handleFullClear} // Dùng hàm clear mới
      >
        {/* Thêm các nút vào đây */}
        <button type="button" className="save-btn" onClick={handleSave} disabled={isTranslating || !translation}>
          Save Word
        </button>
        <button type="button" className="speak-btn" onClick={handleSpeak} disabled={!selectedText || isSpeakingPopup}>
          {isSpeakingPopup ? 'Speaking...' : 'Speak'}
        </button>
      </TranslationPopup>
    </>
  );
};

export default UserConversation;
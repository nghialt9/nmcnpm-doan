import React, { useRef, useCallback, useState, useEffect } from "react";
import "../chatui.css";
import { RiRobot2Fill } from "react-icons/ri";
import { textToSpeechFromServer } from "../../../services/chat";
import ButtonTranslate from "../../ButtonTranslate";
import ButtonSpeaker from "../../ButtonSpeaker";

import { useTranslationPopup } from '../../../hooks/useTranslationPopup'; // Import hook
import TranslationPopup from './TranslationPopup'; // Import component popup

interface BotConversationProps {
  content: string;
  onSaveWord: (word: string, meaning: string) => void;
}

const BotConversation: React.FC<BotConversationProps> = ({ content, onSaveWord }) => {
  const [isSpeakingPopup, setIsSpeakingPopup] = useState<boolean>(false);
  const popupAudioRef = useRef<HTMLAudioElement | null>(null);
  const botMessageRef = useRef<HTMLDivElement | null>(null);

  const {
    popupRef,
    selectedText,
    translation,
    isTranslating,
    popupPos,
    showTranslationPopup,
    clearPopup
  } = useTranslationPopup();

  const showPopupForSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    if (popupRef.current && popupRef.current.contains(e.target as Node)) return;

    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : "";
    if (!text || !sel) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    showTranslationPopup(text, rect);
  };

  const showPopupForEntireMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = botMessageRef.current?.getBoundingClientRect();
    if (!rect) return;
    showTranslationPopup(content, rect);
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

  return (
    <>
      <div className="chat bott" ref={botMessageRef} onMouseUp={showPopupForSelection}>
        <div style={{ display: "flex", alignItems: "center", minWidth: 65 }}>
          <RiRobot2Fill size={30} />
          <span className="bot-label" style={{ marginLeft: 5 }}>Bot</span>
        </div>
        <p className="txt">{content}</p>

        <div className="botFunction">
          <ButtonSpeaker text={content} />
          <ButtonTranslate onClick={showPopupForEntireMessage} />
        </div>
      </div>

      <TranslationPopup
        ref={popupRef}
        pos={popupPos}
        isTranslating={isTranslating}
        originalText={selectedText}
        translatedText={translation}
        onClose={handleFullClear}
      >
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

export default BotConversation;
import { useState, useRef, useCallback, useEffect } from 'react';
import { translate } from '../services/chat'; // Đảm bảo đường dẫn này đúng

// Định nghĩa kiểu cho vị trí popup
interface PopupPosition {
  top: number;
  left: number;
  visible: boolean;
}

// Hook để xử lý việc click ra ngoài một element
function useOutsideAlerter(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    function handle(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        cb();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, cb]);
}

export const useTranslationPopup = () => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [translation, setTranslation] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [popupPos, setPopupPos] = useState<PopupPosition>({ top: 0, left: 0, visible: false });
  const popupRef = useRef<HTMLDivElement | null>(null);

  const clearPopup = useCallback(() => {
    setSelectedText("");
    setTranslation("");
    setPopupPos({ top: 0, left: 0, visible: false });
  }, []);

  useOutsideAlerter(popupRef, clearPopup);

  const showTranslationPopup = useCallback(async (textToTranslate: string, baseRect: DOMRect) => {
    if (!textToTranslate.trim()) return;

    const chatsEl = document.querySelector(".chats");
    const scrollTop = chatsEl?.scrollTop || 0;

    setPopupPos({
      top: baseRect.bottom + scrollTop + 8,
      left: baseRect.left + window.scrollX,
      visible: true
    });

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

  return {
    popupRef,
    selectedText,
    translation,
    isTranslating,
    popupPos,
    showTranslationPopup,
    clearPopup
  };
};
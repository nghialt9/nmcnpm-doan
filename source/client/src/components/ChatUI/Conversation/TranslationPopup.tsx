import React, { forwardRef, ReactNode } from 'react';
import '../chatui.css'; 
interface TranslationPopupProps {
  pos: {
    top: number;
    left: number;
    visible: boolean;
  };
  isTranslating: boolean;
  originalText: string;
  translatedText: string;
  onClose: () => void;
  children?: ReactNode; 
}

const TranslationPopup = forwardRef<HTMLDivElement, TranslationPopupProps>(({
  pos,
  isTranslating,
  originalText,
  translatedText,
  onClose,
  children
}, ref) => {
  if (!pos.visible) return null;

  return (
    <div
      ref={ref}
      className="translation-popup"
     
    >
      <div className="translation-header">
        <h4>Translation</h4>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
      <div className="translation-content">
        {isTranslating ? (
          <p>Loading…</p>
        ) : (
          <>
            <div className="translation-item">
              <span className="label">Original:</span>
              <p className="text">{originalText}</p>
            </div>
            <div className="translation-item">
              <span className="label">Translated:</span>
              <p className="text">{translatedText}</p>
            </div>
          </>
        )}
      </div>
      {children && !isTranslating && (
        <div className="popup-actions">
          {children}
        </div>
      )}
    </div>
  );
});

export default TranslationPopup;
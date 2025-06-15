import React from 'react';
import { FaLanguage } from 'react-icons/fa';
import './index.css'; // Chúng ta sẽ cần file CSS này

interface ButtonTranslateProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const ButtonTranslate: React.FC<ButtonTranslateProps> = ({ onClick, disabled }) => {
  return (
    <div>
      <button
        className="translate-btn"
        onClick={onClick}
        disabled={disabled}
        title="Translate full message"
        aria-label="Translate full message"
      >
        <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaLanguage size={22} color="cadetblue" />
        </div>
      </button>
    </div>
  );
};

export default ButtonTranslate;
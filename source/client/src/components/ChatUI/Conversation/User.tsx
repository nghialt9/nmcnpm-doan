import React from "react";

import "../chatui.css";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../../../providers/AuthContext";
import { IoPersonSharp } from "react-icons/io5";
import { translate } from "../../../services/chat";

interface UserConversationProps {
  content: string;
  created_at?: string;
}

const UserConversation: React.FC<UserConversationProps> = ({ content, created_at }) => {
  const { state } = useAuth();
  
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleMouseUp = async (event: React.MouseEvent<HTMLDivElement>) => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText) {
      try {
        const response = await translate(selectedText);
        if (response.success && response.translatedText) {
          alert(
            `Selected Text: ${selectedText}\nTranslation: ${response.translatedText}`
          );
        } else {
          console.error("Translation failed:", response.error);
        }
      } catch (error) {
        console.error("Error translating:", error);
      }
    }
  };

  return (
    <div className={`chat user`} onMouseUp={handleMouseUp}>
      <div style={{ display: 'block', alignItems: 'center' }}>
        <IoPersonSharp size={30} />
        {state.user?.username && <span className="user-label">{state.user.username}</span>}
      </div>
      <div className="message-container">
        <p className="txt">{content}</p>
        <span className="message-time">{formatTime(created_at)}</span>
      </div>
    </div>
  );
};

export default UserConversation;

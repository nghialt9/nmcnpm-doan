import React from "react";

import "../chatui.css";
import { FaUser } from "react-icons/fa";

const UserConversation = ({ content }: any) => {
  return (
    <div className={`chat user`}>
      <FaUser size={30} />
      <p className="txt">{content}</p>
    </div>
  );
};

export default UserConversation;

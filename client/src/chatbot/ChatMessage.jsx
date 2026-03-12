import React from "react";
import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({ chat }) => {
  return (
    <div
      className={`message ${chat.role === "model" ? "bot" : "user"}-message`}
    >
      {chat.role === "model" && <ChatbotIcon />}
      <p className="message-text">
        {chat.text}
        {chat.typing && <span className="typing-cursor" />}
      </p>
    </div>
  );
};

export default ChatMessage;

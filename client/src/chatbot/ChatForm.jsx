import React, { useRef } from "react";
import { IoSend } from "react-icons/io5";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponce }) => {
  const inputRef = useRef();

  const handdleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";

    setChatHistory((history) => [
      ...history,
      { role: "user", text: userMessage },
    ]);

    setTimeout(() => {
      setChatHistory((history) => [
        ...history,
        { role: "model", text: "Thinking..." },
      ]);
      generateBotResponce([
        ...chatHistory,
        { role: "user", text: userMessage },
      ]);
    }, 600);
  };

  return (
    <form action="#" className="chat-form" onSubmit={handdleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="message-input"
        required
      />
      <button className="material-symbols-outlined">
        <IoSend />
      </button>
    </form>
  );
};

export default ChatForm;

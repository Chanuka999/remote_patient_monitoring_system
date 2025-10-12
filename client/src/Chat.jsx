import React, { useEffect, useRef, useState } from "react";
import { IoChatbox } from "react-icons/io5";
import { FaArrowDown } from "react-icons/fa";
import ChatbotIcon from "./chatbot/ChatbotIcon";
import ChatForm from "./chatbot/ChatForm";
import ChatMessage from "./chatbot/ChatMessage";

const Chat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponce = async (history) => {
    const updateHistory = (text) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text },
      ]);
    };
    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl || apiUrl.includes("generativelanguage.googleapis.com")) {
        // If there's no API URL configured or it points to an external Google API
        // that requires a private key, avoid calling it directly from client-side.
        console.warn(
          "Chatbot: VITE_API_URL is not configured or points to a third-party API; skipping request from client. Configure a server-side proxy instead."
        );
        updateHistory(
          "Chatbot is not available (server-side API not configured).",
          true
        );
        return;
      }
      const responce = await fetch(apiUrl, requestOptions);
      const data = await responce.json();
      if (!responce.ok)
        throw new Error(data.error.message || "something went wrong!");
      const apiresponceText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      updateHistory(apiresponceText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);
  return (
    <div className={`chatbot-container ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        onClick={() => setShowChatbot((prev) => !prev)}
        id="chatbot-toggler"
      >
        <span className="material-symbols-outlined">
          <IoChatbox size={25} />
        </span>
        {/* <span className="material-symbols-outlined">close</span> */}
      </button>

      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button
            onClick={() => setShowChatbot((prev) => !prev)}
            className="material-symbols-outlined"
          >
            <FaArrowDown />
          </button>
        </div>
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there <br /> How can I help you today?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponce={generateBotResponce}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;

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

  const typewriterLines = (fullText, onUpdate, onDone) => {
    const lines = fullText.split("\n");
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      const partial = lines.slice(0, idx).join("\n");
      const done = idx >= lines.length;
      onUpdate(partial, !done);
      if (done) {
        clearInterval(interval);
        onDone();
      }
    }, 120);
  };

  const generateBotResponce = async (history) => {
    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history }),
    };
    try {
      const serverChatEndpoint = `/api/chat`;
      const responce = await fetch(serverChatEndpoint, requestOptions);
      const data = await responce.json();
      if (!responce.ok)
        throw new Error(data?.error?.message || "something went wrong!");
      const fullText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();

      // Swap "Thinking..." for an empty typing message, then animate line by line
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text: "", typing: true },
      ]);

      typewriterLines(
        fullText,
        (partial, isTyping) => {
          setChatHistory((prev) => {
            const updated = [...prev];
            const last = updated.length - 1;
            if (updated[last]?.role === "model") {
              updated[last] = {
                role: "model",
                text: partial,
                typing: isTyping,
              };
            }
            return updated;
          });
        },
        () => {
          setChatHistory((prev) => {
            const updated = [...prev];
            const last = updated.length - 1;
            if (updated[last]?.role === "model") {
              updated[last] = { ...updated[last], typing: false };
            }
            return updated;
          });
        },
      );
    } catch (error) {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text: error.message, typing: false },
      ]);
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
            <h2 className="logo-text">HealthLink Assistant</h2>
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
              Hello! I am HealthLink, your healthcare assistant. <br />
              Ask me about symptoms, health readings, doctors, or appointments.
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

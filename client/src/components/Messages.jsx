import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Messages = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  const apiBase = import.meta.env.VITE_BACKEND_URL || "";

  // Get current user from localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(user);
      if (!user.id && !user._id) {
        navigate("/login");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch contacts (patients if doctor, doctors if patient)
  useEffect(() => {
    if (!currentUser?.id && !currentUser?._id) return;

    const fetchContacts = async () => {
      try {
        setLoading(true);

        // Check if user is a doctor
        const isDoctor = currentUser?.role === "doctor";

        if (isDoctor) {
          // Fetch all patients
          const response = await fetch(`${apiBase}/api/patients`);
          const result = await response.json();

          if (result.success) {
            setContacts(result.data);
            // Initialize with first patient if available
            if (result.data.length > 0) {
              setSelectedConversation({
                id: result.data[0]._id,
                contactName: result.data[0].name,
                contactEmail: result.data[0].email,
                specialty: "Patient",
                avatar: "👤",
                icon: "👨‍🦰",
                lastMessage: "",
                timestamp: "Now",
                unread: 0,
                status: "online",
              });
            }
          }
        } else {
          // Fetch all doctors
          const response = await fetch(`${apiBase}/api/doctors`);
          const result = await response.json();

          if (result.success) {
            setContacts(result.data);
            // Initialize with first doctor if available
            if (result.data.length > 0) {
              setSelectedConversation({
                id: result.data[0]._id,
                contactName: result.data[0].name,
                specialty: "Healthcare Provider",
                avatar: "👨‍⚕️",
                lastMessage: "",
                timestamp: "Now",
                unread: 0,
                status: "online",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentUser, apiBase]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!selectedConversation || (!currentUser?.id && !currentUser?._id))
      return;

    const fetchMessages = async () => {
      try {
        const isDoctor = currentUser?.role === "doctor";
        const userId = currentUser?.id || currentUser?._id;
        const contactId = selectedConversation.id;

        let endpoint = "";
        if (isDoctor) {
          // Doctor viewing messages from a patient
          endpoint = `${apiBase}/api/${contactId}/${userId}`;
        } else {
          // Patient viewing messages from a doctor
          endpoint = `${apiBase}/api/${userId}/${contactId}`;
        }

        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success) {
          const contactName =
            selectedConversation.contactName || selectedConversation.doctorName;
          const formattedMessages = result.data.map((msg) => ({
            id: msg._id,
            sender:
              (isDoctor && msg.senderType === "patient") ||
              (!isDoctor && msg.senderType === "patient")
                ? contactName
                : "You",
            type:
              msg.senderType === (isDoctor ? "patient" : "patient")
                ? "received"
                : "sent",
            text: msg.message,
            timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedConversation, currentUser, apiBase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const isDoctor = currentUser?.role === "doctor";
      const userId = currentUser?.id || currentUser?._id;
      const contactId = selectedConversation.id;

      let body = {};
      if (isDoctor) {
        // Doctor sending message to patient
        body = {
          patientId: contactId,
          doctorId: userId,
          message: newMessage,
          senderType: "doctor",
        };
      } else {
        // Patient sending message to doctor
        body = {
          patientId: userId,
          doctorId: contactId,
          message: newMessage,
          senderType: "patient",
        };
      }

      const response = await fetch(`${apiBase}/api/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        // Add message to local state
        const message = {
          id: result.data._id,
          sender: "You",
          type: "sent",
          text: newMessage,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages([...messages, message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSelectConversation = (contact) => {
    const isDoctor = currentUser?.role === "doctor";
    setSelectedConversation({
      id: contact._id,
      contactName: contact.name,
      contactEmail: contact.email,
      specialty: isDoctor ? "Patient" : "Healthcare Provider",
      avatar: isDoctor ? "👤" : "👨‍⚕️",
      lastMessage: "",
      timestamp: "Now",
      unread: 0,
      status: "online",
    });
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.4s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #3b82f6;
          animation: typing 1.4s infinite;
        }
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }
        .messages-container {
          display: flex;
          height: 600px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .messages-sidebar {
          width: 320px;
          background: white;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .messages-main {
          flex: 1;
          background: white;
          display: flex;
          flex-direction: column;
        }
        .conversation-list {
          flex: 1;
          overflow-y: auto;
        }
        .messages-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f9fafb;
        }
        .message-bubble {
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease-out;
        }
        .messages-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .messages-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .messages-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .messages-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .conversation-list::-webkit-scrollbar {
          width: 6px;
        }
        .conversation-list::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .conversation-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        @media (max-width: 768px) {
          .messages-sidebar {
            width: 100%;
            height: auto;
            max-height: 300px;
          }
          .messages-container {
            flex-direction: column;
            height: auto;
          }
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            💬{" "}
            {currentUser?.role === "doctor"
              ? "Patient Messages"
              : "Doctor Messages"}
          </h1>
          <p className="text-slate-300">
            {currentUser?.role === "doctor"
              ? "View and respond to messages from your patients"
              : "Communicate with your healthcare providers"}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
            <p className="text-white text-lg">Loading your doctors...</p>
          </div>
        ) : (
          <>
            <div className="messages-container">
              {/* Sidebar - Conversations List */}
              <div className="messages-sidebar animate-slide-in">
                <div className="p-4 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search doctors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="conversation-list">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact._id}
                        onClick={() => handleSelectConversation(contact)}
                        className={`px-4 py-3 cursor-pointer border-b border-gray-100 transition ${
                          selectedConversation?.id === contact._id
                            ? "bg-blue-50 border-l-4 border-l-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {currentUser?.role === "doctor" ? "👤" : "👨‍⚕️"}
                            </span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">
                                {contact.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {contact.specialty ||
                                  (currentUser?.role === "doctor"
                                    ? "Patient"
                                    : "Healthcare Provider")}
                              </p>
                            </div>
                          </div>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p>
                        No{" "}
                        {currentUser?.role === "doctor"
                          ? "patients"
                          : "doctors"}{" "}
                        found
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Chat Area */}
              {selectedConversation ? (
                <div className="messages-main animate-fade-in">
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {currentUser?.role === "doctor" ? "👤" : "👨‍⚕️"}
                      </span>
                      <div>
                        <h2 className="font-bold text-gray-900">
                          {selectedConversation.contactName}
                        </h2>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          {selectedConversation.specialty}
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs text-green-600">
                              Online
                            </span>
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition text-xl">
                        📞
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 transition text-xl">
                        ℹ️
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="messages-scroll">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div key={message.id} className="message-bubble">
                          {message.type === "sent" ? (
                            <div className="flex justify-end">
                              <div className="max-w-xs">
                                <div className="bg-blue-500 text-white rounded-lg rounded-tr-none px-4 py-2">
                                  <p className="text-sm break-words">
                                    {message.text}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                  {message.timestamp}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-start">
                              <div className="max-w-xs">
                                <div className="bg-gray-200 text-gray-900 rounded-lg rounded-tl-none px-4 py-2">
                                  <p className="text-sm break-words">
                                    {message.text}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-left">
                                  {message.timestamp}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No messages yet. Start a conversation!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-gray-100 transition text-xl"
                      >
                        📎
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className={`px-6 py-2 rounded-lg font-semibold transition transform ${
                          newMessage.trim()
                            ? "bg-blue-500 text-white hover:bg-blue-600 hover:-translate-y-0.5"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="messages-main flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">
                      Select a doctor to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="text-3xl mb-3">📞</div>
                <h3 className="font-bold text-gray-900 mb-2">Quick Response</h3>
                <p className="text-sm text-gray-600">
                  Get responses from doctors within 2-4 hours during working
                  days
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Secure & Private
                </h3>
                <p className="text-sm text-gray-600">
                  All messages are encrypted and comply with healthcare privacy
                  standards
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Message History
                </h3>
                <p className="text-sm text-gray-600">
                  Keep all your conversations for future reference and
                  continuity of care
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;

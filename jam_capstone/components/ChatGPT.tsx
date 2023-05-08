import React, { useState } from "react";
import axios from "axios";


const ChatGPT = () => {
  const [article, setArticle] = useState("");
  const [title, setTitle] = useState("");
  const [numLines, setNumLines] = useState(1); // default number of lines
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatResponse = async () => {
    try {
      const messages = chatHistory.map((msg, idx) => {
        const role = idx % 2 === 0 ? "user" : "assistant";
        return { role: role, content: msg };
      });

      // Add the user's current message
      messages.push({ role: "user", content: title });

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: messages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          },
        }
      );
      const aiResponse = response.data.choices[0].message.content;
      setArticle(aiResponse);

      // Update the chat history
      setChatHistory([...chatHistory, title, aiResponse]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    chatResponse();
    setTitle(''); // Clear the input after sending the message
  };
  const handleNumLinesChange = (e) => {
    const value = parseInt(e.target.value, 10); // Convert value to number
    setNumLines(value);
  };
  const handleToggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div>
      <button
        onClick={handleToggleChat}
        style={{
          marginBottom: "10px",
          fontSize: "16px",
          padding: "8px 12px",
          borderRadius: "4px",
          border: "none",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          background: showChat ? "#f44336" : "#4CAF50",
          color: "#fff",
        }}
      >
        {showChat ? "Close Chat" : "Open Chat"}
      </button>
      {showChat && (
        <div
          style={{
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            width: "70vw",
            height: "25vh",
            overflow: "auto",
            padding: "10px",
            margin: "10px",
            marginBottom: "20px",
            fontSize: "20px",
            border: "1px solid #ccc",
            borderRadius: "15px",
          }}
        >
          <div className="chat-messages-container mb-2">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                style={{
                  background: "#D3D3D3",
                  borderRadius: "15px",
                  padding: "8px",
                  margin: "6px 0",
                }}
              >
                <span style={{ color: "black" }}>
                  {msg}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="chatInput" style={{ display: "block", marginBottom: "6px" }}>
              Type your message:
            </label>
            <textarea
              id="chatInput"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={numLines}
              style={{
                width: "100%",
                marginBottom: "10px",
                padding: "8px",
                fontSize: "18px",
                resize: "none",
                border: "1px solid #ccc",
                borderRadius: "10px",
              }}
            />
            <button
              type="submit"
              style={{
                fontSize: "16px",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "none",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: "#4CAF50",
                color: "#fff",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );

};

export default ChatGPT;
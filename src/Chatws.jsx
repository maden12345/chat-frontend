import React, { useEffect, useState, useRef } from "react";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws/chat");

    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(input);
      setInput("");
    }
  };

  return (
    <div style={{ width: 400, margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
          backgroundColor: "#f9f9f9",
          borderRadius: 4,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ padding: "4px 0" }}>
            {msg}
          </div>
        ))}
      </div>
      <input
        style={{ width: "calc(100% - 70px)", padding: 8, fontSize: 16 }}
        type="text"
        placeholder="Mesajınızı yazın..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button
        style={{
          width: 60,
          padding: "8px 0",
          fontSize: 16,
          marginLeft: 10,
          cursor: "pointer",
          borderRadius: 4,
        }}
        onClick={sendMessage}
      >
        Gönder
      </button>
    </div>
  );
}

export default Chat;


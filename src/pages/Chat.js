import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const ws = useRef(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const WS_URL = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws/chat";

  useEffect(() => {
    if (!token || !username) {
      navigate("/login");
      return;
    }

    ws.current = new WebSocket(`${WS_URL}?username=${username}`);

    ws.current.onopen = () => {
      console.log("WebSocket bağlantısı açıldı.");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat_message") {
        setMessages((prev) => [...prev, { sender: data.sender, content: data.content }]);
      }

      if (data.type === "online_users") {
        setOnlineUsers(data.users);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket bağlantısı kapandı.");
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [navigate, token, username, WS_URL]);

  const sendMessage = () => {
    if (message.trim() === "" || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    const msgObj = {
      type: "chat_message",
      content: message,
      sender: username,
    };

    ws.current.send(JSON.stringify(msgObj));
    setMessages((prev) => [...prev, { sender: username, content: message }]);
    setMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Merhaba, {username}</h2>
      <button onClick={handleLogout}>Çıkış Yap</button>

      <div style={{ display: "flex", marginTop: "20px" }}>
        {/* Online kullanıcılar */}
        <div style={{ flex: 1, borderRight: "1px solid #ccc", paddingRight: "10px" }}>
          <h4>Çevrimiçi Kullanıcılar</h4>
          <ul>
            {onlineUsers.map((user, i) => (
              <li key={i}>{user}</li>
            ))}
          </ul>
        </div>

        {/* Mesaj paneli */}
        <div style={{ flex: 3, paddingLeft: "10px" }}>
          <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <strong>{msg.sender}:</strong> {msg.content}
              </div>
            ))}
          </div>

          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{ width: "80%" }}
            />
            <button onClick={sendMessage}>Gönder</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

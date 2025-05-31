import React, { useEffect, useRef, useState } from "react";

function Chat() {
  const [username, setUsername] = useState(localStorage.getItem("username") || null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const ws = useRef(null);
  const selectedUserRef = useRef(null);

  // Eğer username localStorage'da yoksa, kullanıcıyı yönlendirmek için burada ekleme yapılabilir.
  // Mesela: if (!username) return <div>Lütfen giriş yapın</div>;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/users`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((u) => u.username !== username);
        setUsers(filtered);
      })
      .catch(console.error);
  }, [username]);

  const connectWebSocket = () => {
    if (!username) return;

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    ws.current = new WebSocket(`${process.env.REACT_APP_WS_URL}/ws/${username}`);

    ws.current.onopen = () => {
      console.log("WebSocket bağlantısı açıldı.");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const currentSelected = selectedUserRef.current;

      if (
        (data.from_user === username && data.to_user === currentSelected) ||
        (data.from_user === currentSelected && data.to_user === username)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket hatası:", err);
    };

    ws.current.onclose = () => {
      console.log("WebSocket bağlantısı kapandı. Yeniden bağlanıyor...");
      setTimeout(connectWebSocket, 3000);
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [username]);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
    if (selectedUser) {
      fetch(`${process.env.REACT_APP_API_URL}/messages/${username}/${selectedUser}`)
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
        })
        .catch(console.error);
    } else {
      setMessages([]);
    }
  }, [selectedUser, username]);

  const sendMessage = () => {
    if (!selectedUser) return;
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.log("WebSocket bağlantısı açık değil.");
      return;
    }
    if (messageText.trim() === "") return;

    const msg = {
      to_user: selectedUser,
      message: messageText,
    };
    ws.current.send(JSON.stringify(msg));
    setMessageText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div>
      <h2>Hoş geldin, {username}</h2>
      <div style={{ display: "flex" }}>
        <div style={{ width: "200px", borderRight: "1px solid gray" }}>
          {users.length === 0 ? (
            <p>Yükleniyor...</p>
          ) : (
            users.map((user) => (
              <div
                key={user.username}
                onClick={() => setSelectedUser(user.username)}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  backgroundColor:
                    user.username === selectedUser ? "#ddd" : "white",
                }}
              >
                {user.username}
              </div>
            ))
          )}
        </div>

        <div style={{ flex: 1, padding: "10px" }}>
          {selectedUser ? (
            <>
              <div
                style={{
                  border: "1px solid #ccc",
                  height: "300px",
                  overflowY: "scroll",
                  marginBottom: "10px",
                  padding: "5px",
                }}
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      textAlign:
                        msg.from_user === username ? "right" : "left",
                    }}
                  >
                    <b>{msg.from_user}:</b> {msg.message}
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Mesaj yaz..."
                style={{ width: "80%" }}
              />
              <button onClick={sendMessage}>Gönder</button>
            </>
          ) : (
            <p>Kullanıcı seçin.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;

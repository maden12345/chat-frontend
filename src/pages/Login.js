import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username) {
      setError("Kullanıcı adı boş olamaz.");
      return false;
    }
    if (!password) {
      setError("Şifre boş olamaz.");
      return false;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return false;
    }
    setError("");
    return true;
  };

  const login = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Giriş sırasında hata oluştu.");
        setMessage("");
      } else {
        setMessage(data.message || "Giriş başarılı.");
        setError("");
        localStorage.setItem("username", username);  // **Burada eklendi**
        navigate('/chat', { state: { username } });
      }
    } catch (error) {
      setError("Giriş sırasında hata: " + error.message);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Giriş Yap</h2>
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      {message && <div style={{ color: "green", marginBottom: 10 }}>{message}</div>}

      <input
        placeholder="Kullanıcı Adı"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <div style={{ position: "relative", marginBottom: 20 }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, paddingRight: 60 }}
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: 5,
            top: 5,
            height: "calc(100% - 10px)",
            padding: "0 10px",
            cursor: "pointer",
            background: "transparent",
            border: "none",
            color: "#007BFF",
            fontWeight: "bold",
          }}
          type="button"
        >
          {showPassword ? "Gizle" : "Göster"}
        </button>
      </div>

      <button onClick={login} style={{ padding: "10px 20px" }}>
        Giriş Yap
      </button>

      <p style={{ marginTop: 15 }}>
        Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
      </p>
    </div>
  );
}

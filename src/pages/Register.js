import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return false;
    }
    setError("");
    return true;
  };

  const register = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Kayıt sırasında hata oluştu.");
        setMessage("");
      } else {
        setMessage(data.message || "Kayıt başarılı.");
        setError("");
        navigate("/login");
      }
    } catch (error) {
      setError("Kayıt sırasında hata: " + error.message);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Kayıt Ol</h2>
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

      <input
        type={showPassword ? "text" : "password"}
        placeholder="Şifre Tekrar"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />

      <button onClick={register} style={{ padding: "10px 20px" }}>
        Kayıt Ol
      </button>

      <p style={{ marginTop: 15 }}>
        Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
      </p>
    </div>
  );
}

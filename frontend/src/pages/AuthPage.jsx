import React, { useState } from "react";
import { signInUser, signUpUser, confirmSignUpUser } from "../utils/auth";
import { API_BASE } from "../utils/theme";

function AuthPage({ onLoginSuccess, theme, darkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("login"); // "login", "signup", "confirm"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const user = await signInUser(email, password);
        setMessage("✨ Revelio! Portal opened successfully.");
        
        // Persist user registration in DynamoDB
        try {
          const payload = {
            email: user.email,
            role: user.role,
            name: user.name
          };
          const headers = user.token ? { "Authorization": user.token } : {};
          await fetch(`${API_BASE}/users`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...headers
            },
            body: JSON.stringify(payload)
          });
        } catch (dbErr) {
          console.error("Failed to sync registration to DynamoDB:", dbErr);
        }

        setTimeout(() => {
          onLoginSuccess(user);
        }, 1000);
      } else if (mode === "signup") {
        await signUpUser(email, password);
        setMessage("✨ Spell cast! A verification scroll has been sent to your email.");
        setMode("confirm");
      } else if (mode === "confirm") {
        await confirmSignUpUser(email, code);
        setMessage("✨ Verified! You may now enter the marketplace.");
        setMode("login");
        setPassword("");
        setCode("");
      }
    } catch (err) {
      setError(err.message || "An arcane disturbance occurred.");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    ...theme.section.card,
    maxWidth: "450px",
    margin: "8rem auto 2rem",
    boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(197, 160, 40, 0.15)",
    transition: "all 0.3s ease",
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <h1 style={theme.header.title}>
          The Diagon Alley
        </h1>
        <p style={theme.header.subtitle}>
          A secure wizarding portal. Please identify yourself to enter.
        </p>
      </div>

      <div style={cardStyle}>
        <h3
          style={{
            margin: "0 0 1.5rem",
            color: theme.page.color,
            fontSize: "1.6rem",
            fontWeight: 600,
            fontFamily: "'Cinzel', serif",
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        >
          {mode === "login"
            ? "Mage Authentication"
            : mode === "signup"
              ? "Register New Initiate"
              : "Verify Identity Scroll"}
        </h3>

        {error && (
          <div
            style={{
              background: theme.error.background,
              border: `1px solid ${theme.crimson}44`,
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              color: theme.error.text,
              fontSize: "0.95rem",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div
            style={{
              background: darkMode ? "rgba(197, 160, 40, 0.1)" : "#fdfcf0",
              border: `1px solid ${theme.gold}88`,
              borderRadius: "12px",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              color: darkMode ? theme.gold : "#8a6d00",
              fontSize: "0.95rem",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {mode !== "confirm" && (
            <div>
              <label
                style={{
                  fontSize: "0.85rem",
                  color: theme.text.secondary,
                  display: "block",
                  marginBottom: "0.4rem",
                  fontWeight: 500,
                  fontFamily: "'Spectral', serif",
                }}
              >
                Wizarding Email Address
              </label>
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. harry@hogwarts.edu"
                style={theme.input.base}
              />
            </div>
          )}

          {mode !== "confirm" && (
            <div>
              <label
                style={{
                  fontSize: "0.85rem",
                  color: theme.text.secondary,
                  display: "block",
                  marginBottom: "0.4rem",
                  fontWeight: 500,
                  fontFamily: "'Spectral', serif",
                }}
              >
                Secret incantation (Password)
              </label>
              <input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={theme.input.base}
              />
            </div>
          )}

          {mode === "confirm" && (
            <div>
              <p style={{ ...theme.textMuted, fontSize: "0.95rem", textAlign: "center", marginBottom: "1rem" }}>
                An authentication scroll has been cast to <strong>{email}</strong>. Enter the numerical sigil code below:
              </p>
              <label
                style={{
                  fontSize: "0.85rem",
                  color: theme.text.secondary,
                  display: "block",
                  marginBottom: "0.4rem",
                  fontWeight: 500,
                  fontFamily: "'Spectral', serif",
                  textAlign: "center",
                }}
              >
                Verification Sigil
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 123456"
                style={{ ...theme.input.base, textAlign: "center", letterSpacing: "4px", fontSize: "1.2rem" }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...theme.button.primary,
              width: "100%",
              padding: "0.9rem",
              marginTop: "0.5rem",
              fontSize: "1.05rem",
              letterSpacing: "0.05em",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Casting Spell…"
              : mode === "login"
                ? "Enter Marketplace"
                : mode === "signup"
                  ? "Register Sigil"
                  : "Confirm Verification"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", borderTop: `1px solid ${theme.gold}22`, paddingTop: "1rem" }}>
          {mode === "login" ? (
            <p style={{ margin: 0, fontSize: "0.9rem", color: theme.text.secondary }}>
              New initiate?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setMessage(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: theme.gold,
                  cursor: "pointer",
                  fontWeight: 600,
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Cast Registration Spell
              </button>
            </p>
          ) : mode === "signup" ? (
            <p style={{ margin: 0, fontSize: "0.9rem", color: theme.text.secondary }}>
              Already registered?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setMessage(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: theme.gold,
                  cursor: "pointer",
                  fontWeight: 600,
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Sign In Instead
              </button>
            </p>
          ) : (
            <button
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: theme.gold,
                cursor: "pointer",
                fontWeight: 600,
                textDecoration: "underline",
                padding: 0,
                fontSize: "0.9rem",
              }}
            >
              ← Back to Registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

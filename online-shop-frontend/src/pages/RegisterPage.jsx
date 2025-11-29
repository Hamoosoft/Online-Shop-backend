import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterPage({ onRegisterSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordRepeat) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("http://localhost:9090/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Registrierung fehlgeschlagen");
      }

      const data = await resp.json();
      // nach Registrierung direkt einloggen
      onRegisterSuccess(data);
    } catch (err) {
      setError(err.message || "Unbekannter Fehler bei der Registrierung");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h2>Registrieren</h2>
        <p className="subheading">
          Erstelle dein Konto für HSIG Onlineshopping.
        </p>
      </div>

      <div className="auth-layout">
        <div className="card auth-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Dein Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passwort</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passwort wiederholen</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={passwordRepeat}
                onChange={(e) => setPasswordRepeat(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="info-text error" style={{ marginTop: "0.2rem" }}>
                {error}
              </p>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? "Wird erstellt…" : "Konto erstellen"}
              </button>

              <p className="form-hint">
                Du hast schon ein Konto?{" "}
                <Link to="/login">Zum Login</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

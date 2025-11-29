import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Login fehlgeschlagen");
      }

      const data = await resp.json();
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || "Unbekannter Fehler beim Login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h2>Einloggen</h2>
        <p className="subheading">
          Melde dich bei HSIG Onlineshopping mit deinem Konto an.
        </p>
      </div>

      <div className="auth-layout">
        <div className="card auth-card">
          <form onSubmit={handleSubmit}>
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
                {loading ? "Wird eingeloggt…" : "Einloggen"}
              </button>

              <p className="form-hint">
                Noch kein Konto?{" "}
                <Link to="/register">Jetzt registrieren</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

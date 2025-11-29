import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage({ authUser }) {
  const navigate = useNavigate();

  const [name, setName] = useState(authUser?.name || "");
  const [email] = useState(authUser?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
    } else {
      setName(authUser.name || "");
    }
  }, [authUser, navigate]);

  if (!authUser) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage("");
    setSavingProfile(true);

    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser.token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Profil konnte nicht aktualisiert werden.");
      }

      const updated = await response.json();

      const newAuthUser = {
        ...authUser,
        name: updated.name ?? name,
        email: updated.email ?? authUser.email,
        role: updated.role ?? authUser.role,
      };
      localStorage.setItem("authUser", JSON.stringify(newAuthUser));

      setProfileMessage("Profil wurde aktualisiert.");
    } catch (err) {
      setProfileMessage("Fehler: " + (err.message || "Unbekannter Fehler"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (!currentPassword || !newPassword) {
      setPasswordMessage("Bitte alle Felder ausfüllen.");
      return;
    }

    if (newPassword !== newPasswordRepeat) {
      setPasswordMessage("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch(
        "/api/users/me/password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authUser.token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Passwort konnte nicht geändert werden.");
      }

      setPasswordMessage("Passwort wurde erfolgreich geändert.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordRepeat("");
    } catch (err) {
      setPasswordMessage("Fehler: " + (err.message || "Unbekannter Fehler"));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h2>Mein Profil</h2>
        <p className="subheading">
          Verwalte deine Kontodaten für HSIG Onlineshopping.
        </p>
      </div>

      <div className="profile-layout">
        <div className="card profile-card">
          <h3>Profildaten</h3>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input
                type="email"
                className="form-input"
                value={email}
                disabled
              />
              <p className="form-hint">
                Die E-Mail-Adresse ist Ihr Login-Name.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Anzeigename</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {profileMessage && (
              <p
                className={
                  "info-text" +
                  (profileMessage.startsWith("Fehler") ? " error" : "")
                }
              >
                {profileMessage}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={savingProfile}
            >
              {savingProfile ? "Speichern..." : "Profil speichern"}
            </button>
          </form>
        </div>

        <div className="card profile-card">
          <h3>Passwort ändern</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Aktuelles Passwort</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Neues Passwort</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Neues Passwort wiederholen</label>
              <input
                type="password"
                className="form-input"
                value={newPasswordRepeat}
                onChange={(e) => setNewPasswordRepeat(e.target.value)}
                required
              />
            </div>

            {passwordMessage && (
              <p
                className={
                  "info-text" +
                  (passwordMessage.startsWith("Fehler") ? " error" : "")
                }
              >
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-secondary btn-block"
              disabled={savingPassword}
            >
              {savingPassword ? "Wird geändert..." : "Passwort ändern"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

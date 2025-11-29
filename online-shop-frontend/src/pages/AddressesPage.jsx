import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddressesPage({ authUser }) {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    postalCode: "",
    city: "",
    country: "Deutschland",
    additionalInfo: "",
    defaultAddress: false,
  });

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  const loadAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/addresses", {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Fehler beim Laden der Adressen");
      }
      const data = await resp.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      firstName: "",
      lastName: "",
      street: "",
      postalCode: "",
      city: "",
      country: "Deutschland",
      additionalInfo: "",
      defaultAddress: false,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setForm({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      street: address.street || "",
      postalCode: address.postalCode || "",
      city: address.city || "",
      country: address.country || "Deutschland",
      additionalInfo: address.additionalInfo || "",
      defaultAddress: address.defaultAddress || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Adresse wirklich löschen?")) return;

    try {
      const resp = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      });

      if (!resp.ok && resp.status !== 204) {
        const text = await resp.text();
        throw new Error(text || "Adresse konnte nicht gelöscht werden");
      }

      setMessage("Adresse wurde gelöscht.");
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Fehler beim Löschen der Adresse");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = { ...form };

    try {
      const url = editingId
        ? `/api/addresses/${editingId}`
        : "/api/addresses";
      const method = editingId ? "PUT" : "POST";

      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Adresse konnte nicht gespeichert werden");
      }

      setMessage(editingId ? "Adresse aktualisiert." : "Adresse hinzugefügt.");
      resetForm();
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Unbekannter Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  const markAsDefault = async (id) => {
    try {
      const resp = await fetch(
        `/api/addresses/${id}/default`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Standardadresse konnte nicht gesetzt werden");
      }
      setMessage("Standardadresse aktualisiert.");
      await loadAddresses();
    } catch (err) {
      setError(err.message || "Fehler beim Setzen der Standardadresse");
    }
  };

  return (
    <div className="addresses-page">
      <div className="page-header">
        <h2>Meine Adressen</h2>
        <p className="subheading">
          Verwalte deine Lieferadressen für HSIG Onlineshopping.
        </p>
      </div>

      <div className="addresses-columns">
        {/* Linke Spalte: Formular */}
        <div className="card address-form-card">
          <h3 className="section-title">
            {editingId ? "Adresse bearbeiten" : "Neue Adresse hinzufügen"}
          </h3>
          <form onSubmit={handleSubmit} className="address-form">
            <div className="address-form-row">
              <div className="form-group">
                <label className="form-label">Vorname</label>
                <input
                  type="text"
                  className="form-input"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nachname</label>
                <input
                  type="text"
                  className="form-input"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Straße / Hausnummer</label>
              <input
                type="text"
                className="form-input"
                name="street"
                value={form.street}
                onChange={handleChange}
                required
              />
            </div>

            <div className="address-form-row">
              <div className="form-group">
                <label className="form-label">PLZ</label>
                <input
                  type="text"
                  className="form-input"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ort</label>
                <input
                  type="text"
                  className="form-input"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Land</label>
                <input
                  type="text"
                  className="form-input"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Adresszusatz (optional)</label>
              <input
                type="text"
                className="form-input"
                name="additionalInfo"
                value={form.additionalInfo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-group-inline">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  name="defaultAddress"
                  checked={form.defaultAddress}
                  onChange={handleChange}
                />{" "}
                Als Standardadresse verwenden
              </label>
            </div>

            {error && (
              <p className="info-text error" style={{ marginTop: "0.3rem" }}>
                {error}
              </p>
            )}
            {message && !error && (
              <p className="info-text" style={{ marginTop: "0.3rem" }}>
                {message}
              </p>
            )}

            <div className="address-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Speichern..."
                  : editingId
                  ? "Adresse aktualisieren"
                  : "Adresse speichern"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Abbrechen
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Rechte Spalte: gespeicherte Adressen */}
        <div className="address-list-column">
          <div className="card address-list-card">
            <h3 className="section-title">Gespeicherte Adressen</h3>

            {loading && (
              <p className="info-text">Adressen werden geladen…</p>
            )}

            {!loading && addresses.length === 0 && (
              <p className="info-text">
                Du hast noch keine Adresse gespeichert.
              </p>
            )}

            <div className="address-list">
              {addresses.map((address) => (
                <div key={address.id} className="card address-card">
                  <div className="address-card-header">
                    <div>
                      <div className="address-name">
                        {address.firstName} {address.lastName}
                      </div>
                      <div className="address-line">
                        {address.street}
                      </div>
                      <div className="address-line">
                        {address.postalCode} {address.city}
                      </div>
                      <div className="address-line">
                        {address.country}
                      </div>
                      {address.additionalInfo && (
                        <div className="address-line address-additional">
                          {address.additionalInfo}
                        </div>
                      )}
                    </div>
                    <div className="address-card-right">
                      {address.defaultAddress && (
                        <span className="address-badge-default">
                          Standard
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="address-card-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(address)}
                    >
                      Bearbeiten
                    </button>
                    <button
                      className="btn btn-link"
                      onClick={() => handleDelete(address.id)}
                    >
                      Löschen
                    </button>
                    {!address.defaultAddress && (
                      <button
                        className="btn btn-primary"
                        onClick={() => markAsDefault(address.id)}
                      >
                        Als Standard setzen
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function AdminProductsPage({ authUser }) {
  const isAdmin = authUser && authUser.role === "ADMIN";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  if (!isAdmin) {
    return (
      <div className="card">
        <h2>Kein Zugriff</h2>
        <p className="info-text">
          Dieser Bereich ist nur für Administratoren (Rolle ADMIN) sichtbar.
        </p>
      </div>
    );
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/admin/products", {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Fehler beim Laden der Produkte");
      }
      const data = await resp.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unbekannter Fehler beim Laden der Produkte");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price != null ? String(product.price) : "",
      imageUrl: product.imageUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Produkt wirklich löschen?")) return;

    try {
      const resp = await fetch(
        `/api/admin/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        }
      );

      if (!resp.ok && resp.status !== 204) {
        const text = await resp.text();
        throw new Error(text || "Produkt konnte nicht gelöscht werden");
      }

      setMessage("Produkt wurde gelöscht.");
      await loadProducts();
    } catch (err) {
      setError(err.message || "Fehler beim Löschen des Produkts");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      imageUrl: form.imageUrl,
    };

    try {
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
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
        throw new Error(text || "Produkt konnte nicht gespeichert werden");
      }

      const saved = await resp.json();

      setMessage(
        editingId
          ? `Produkt „${saved.name}“ aktualisiert.`
          : `Produkt „${saved.name}“ angelegt.`
      );
      resetForm();
      await loadProducts();
    } catch (err) {
      setError(err.message || "Unbekannter Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Admin · Produkte</h2>
        <p className="subheading">
          Produkte anlegen, bearbeiten und löschen.
        </p>
      </div>

      <div className="card">
        <h3 className="section-title">
          {editingId ? "Produkt bearbeiten" : "Neues Produkt anlegen"}
        </h3>

        {error && (
          <p className="info-text error" style={{ marginBottom: "0.5rem" }}>
            {error}
          </p>
        )}
        {message && (
          <p className="info-text success" style={{ marginBottom: "0.5rem" }}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Beschreibung</label>
            <textarea
              className="form-textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preis (EUR)</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bild-URL</label>
            <input
              className="form-input"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="/images/hoodie.jpg"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? "Wird gespeichert…"
                : editingId
                ? "Änderungen speichern"
                : "Produkt anlegen"}
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

      <div className="card" style={{ marginTop: "1.5rem" }}>
        <h3 className="section-title">Produktübersicht</h3>

        {loading ? (
          <p className="info-text">Produkte werden geladen…</p>
        ) : products.length === 0 ? (
          <p className="info-text">Noch keine Produkte vorhanden.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bild</th>
                  <th>Name</th>
                  <th>Preis</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{ width: "60px", borderRadius: "8px" }}
                        />
                      ) : (
                        <span className="info-text">kein Bild</span>
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{Number(p.price).toFixed(2)} €</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          type="button"
                          onClick={() => handleEdit(p)}
                        >
                          Bearbeiten
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          type="button"
                          onClick={() => handleDelete(p.id)}
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";

export default function AdminOrdersPage({ authUser }) {
  const isAdmin = authUser && authUser.role === "ADMIN";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const resp = await fetch("/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Fehler beim Laden der Bestellungen");
        }
        const data = await resp.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unbekannter Fehler beim Laden der Bestellungen");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authUser.token]);

  const summary = useMemo(() => {
    if (!orders || orders.length === 0) return { count: 0, total: 0 };
    const count = orders.length;
    const total = orders.reduce((sum, o) => {
      const val =
        o.totalAmount ??
        o.totalPrice ??
        o.total ??
        0;
      return sum + Number(val || 0);
    }, 0);
    return { count, total };
  }, [orders]);

  return (
    <div>
      <div className="page-header">
        <h2>Admin · Bestellungen</h2>
        <p className="subheading">
          Übersicht aller Bestellungen im System.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <h3 className="section-title">Zusammenfassung</h3>
        <p className="info-text">
          {summary.count} Bestellungen · Gesamtumsatz{" "}
          {summary.total.toFixed(2)} €
        </p>
      </div>

      <div className="card">
        {error && (
          <p className="info-text error" style={{ marginBottom: "0.5rem" }}>
            {error}
          </p>
        )}

        {loading ? (
          <p className="info-text">Bestellungen werden geladen…</p>
        ) : orders.length === 0 ? (
          <p className="info-text">Noch keine Bestellungen vorhanden.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kunde</th>
                  <th>E-Mail</th>
                  <th>Datum</th>
                  <th>Summe</th>
                  <th>Positionen</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>{order.customerEmail}</td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("de-DE")
                        : "-"}
                    </td>
                    <td>
                      {order.totalAmount != null
                        ? Number(order.totalAmount).toFixed(2)
                        : "0.00"}{" "}
                      €
                    </td>
                    <td>{order.items ? order.items.length : 0}</td>
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

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function OrdersPage({ authUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!authUser) {
    return (
      <div>
        <div className="page-header">
          <h2>Meine Bestellungen</h2>
        </div>
        <div className="card orders-empty-card">
          <p className="info-text">
            Du bist nicht eingeloggt. Bitte melde dich an, um deine Bestellungen zu sehen.
          </p>
          <div style={{ marginTop: "0.8rem" }}>
            <Link to="/login" className="btn btn-primary">
              Zum Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
  if (!authUser) return;

  let intervalId;

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:9090/api/orders?email=${encodeURIComponent(
          authUser.email
        )}`
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Fehler beim Laden der Bestellungen");
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setOrders(list);

      // 🔁 Prüfen, ob noch offene Zahlungen existieren
      const hasPending = list.some((o) =>
        (o.status || "").toUpperCase().includes("PENDING")
      );

      // Wenn keine offenen Zahlungen mehr → Polling stoppen
      if (!hasPending && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    } catch (err) {
      setError(err.message || "Unbekannter Fehler beim Laden der Bestellungen");
    } finally {
      setLoading(false);
    }
  };

  // Initial laden
  fetchOrders();

  // 🔁 Alle 3 Sekunden neu laden
  intervalId = setInterval(fetchOrders, 15000);

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [authUser.email]);


  // Zusammenfassung (Anzahl + Gesamtumsatz)
  const summary = useMemo(() => {
    if (!orders || orders.length === 0) {
      return { count: 0, total: 0 };
    }

    const count = orders.length;
    const total = orders.reduce((sum, order) => {
      const totalValue =
        order.totalAmount ??
        order.totalPrice ??
        order.total ??
        0;
      return sum + Number(totalValue || 0);
    }, 0);

    return { count, total };
  }, [orders]);

  // Status → Label + CSS-Klasse
  const getStatusInfo = (order) => {
  const raw = (order.status || "").toUpperCase();

  if (!raw || raw === "PENDING_PAYMENT") {
    return {
      label: "Wird bezahlt…",
      className: "status-pill status-pending"
    };
  }

  if (raw === "PAID") {
    return {
      label: "Bezahlt",
      className: "status-pill status-completed"
    };
  }

  if (raw === "PAYMENT_FAILED") {
    return {
      label: "Zahlung fehlgeschlagen",
      className: "status-pill status-cancelled"
    };
  }

  return {
    label: raw,
    className: "status-pill status-default"
  };
};


  return (
    <div>
      <div className="page-header">
        <h2>Meine Bestellungen</h2>
        <p className="subheading">
          Übersicht deiner bisher aufgegebenen Bestellungen.
        </p>
      </div>

      {/* Zusammenfassung */}
      <div className="orders-summary card">
        <div className="orders-summary-item">
          <span className="orders-summary-label">Bestellungen</span>
          <span className="orders-summary-value">{summary.count}</span>
        </div>
        <div className="orders-summary-item">
          <span className="orders-summary-label">Gesamtumsatz</span>
          <span className="orders-summary-value">
            {summary.total.toFixed(2)} €
          </span>
        </div>
        <div className="orders-summary-item orders-summary-user">
          <span className="orders-summary-label">Konto</span>
          <span className="orders-summary-email">{authUser.email}</span>
        </div>
      </div>

      {loading && (
        <p className="info-text" style={{ marginTop: "0.8rem" }}>
          Bestellungen werden geladen…
        </p>
      )}

      {error && (
        <p className="info-text error" style={{ marginTop: "0.8rem" }}>
          Fehler: {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="card orders-empty-card">
          <p>Du hast bisher noch keine Bestellung aufgegeben.</p>
          <div style={{ marginTop: "0.8rem" }}>
            <Link to="/" className="btn btn-primary">
              Jetzt einkaufen
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => {
            const dateRaw =
              order.orderDate ??
              order.createdAt ??
              order.creationDate ??
              order.createdOn ??
              null;

            let dateFormatted = null;
            if (dateRaw) {
              try {
                const d = new Date(dateRaw);
                dateFormatted = d.toLocaleString("de-DE");
              } catch {
                dateFormatted = String(dateRaw).replace("T", " ").slice(0, 19);
              }
            }

            const items = Array.isArray(order.items) ? order.items : [];
            const itemCount = items.reduce(
              (sum, item) => sum + (item.quantity ?? 0),
              0
            );

            const total =
              order.totalAmount ??
              order.totalPrice ??
              order.total ??
              0;

            const statusInfo = getStatusInfo(order);

            return (
              <div key={order.id} className="order-card card">
                <div className="order-card-header">
                  <div>
                    <div className="order-id">Bestellung #{order.id}</div>
                    {dateFormatted && (
                      <div className="order-date">am {dateFormatted}</div>
                    )}
                  </div>

                  <div className="order-header-right">
                    <span className={statusInfo.className}>
                      {statusInfo.label}
                    </span>
                    <div className="order-header-meta">
                      <span className="order-chip">
                        {itemCount} Artikel
                      </span>
                      <span className="order-total">
                        {Number(total).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="order-items">
                    {items.map((item, index) => (
                      <div key={index} className="order-item-row">
                        <div className="order-item-main">
                          <div className="order-item-name">
                            {item.productName || item.name || "Artikel"}
                          </div>
                          <div className="order-item-qty">
                            Menge: {item.quantity}
                          </div>
                        </div>
                        {/* KEIN Preis mehr pro Artikel, weil Backend ihn nicht liefert */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

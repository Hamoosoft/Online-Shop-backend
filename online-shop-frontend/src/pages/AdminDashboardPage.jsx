import { Link } from "react-router-dom";
export default function AdminDashboardPage({ authUser }) {
  const isAdmin = authUser && authUser.role === "ADMIN";

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

  return (
    <div className="card">
      <h2>Admin-Dashboard</h2>
      <p className="subheading">
        Verwaltung von Produkten und Bestellungen im HSIG Onlineshopping.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
       <div className="card">
  <h3>Produkte verwalten</h3>
  <p className="info-text">
    Produkte anlegen, bearbeiten und löschen.
  </p>
  <Link to="/admin/products" className="btn btn-primary">
    Zu den Produkten
  </Link>
</div>

<div className="card">
  <h3>Bestellungen verwalten</h3>
  <p className="info-text">
    Übersicht aller Bestellungen, Status anpassen.
  </p>
  <Link to="/admin/orders" className="btn btn-secondary">
    Zu den Bestellungen
  </Link>
</div>

      </div>
    </div>
  );
}

import { Link, useParams } from "react-router-dom";

export default function OrderSuccessPage({ authUser }) {
  const { orderId } = useParams();

  return (
    <div>
      <div className="page-header">
        <h2>Bestellung erfolgreich</h2>
        <p className="subheading">
          Vielen Dank für deine Bestellung{authUser ? `, ${authUser.name}` : ""}!
        </p>
      </div>

      <div className="card order-success-card">
        <div className="order-success-icon">✅</div>

        <p>
          Deine Bestellung wurde erfolgreich gespeichert.
        </p>

        {orderId && (
          <p>
            <strong>Bestellnummer:</strong> {orderId}
          </p>
        )}

        <p className="info-text">
          Du erhältst eine Übersicht deiner Bestellungen unter{" "}
          <strong>„Bestellungen“</strong>, sobald wir diese Seite angebunden
          haben.
        </p>

        <div className="order-success-actions">
          <Link to="/" className="btn btn-primary">
            Weiter einkaufen
          </Link>

          <Link to="/orders" className="btn btn-secondary">
            Meine Bestellungen
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";

export default function CartPage({
  cartItems,
  removeFromCart,
  updateQuantity,
  authUser,
}) {
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleGoToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Dein Warenkorb ist leer.");
      return;
    }
    if (!authUser) {
      alert("Bitte melde dich zuerst an, um zu bestellen.");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div>
      <div className="page-header">
        <h2>Warenkorb</h2>
        <p className="subheading">
          Prüfe deine Artikel. Den nächsten Schritt (Adresse & Zahlung) machst du im Checkout.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="card empty-cart">
          <p>Dein Warenkorb ist momentan leer.</p>
          <Link to="/" className="btn btn-primary">
            Produkte ansehen
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-main">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">
                    Einzelpreis: {Number(item.price).toFixed(2)} €
                  </p>

                  <div className="cart-qty-controls">
                    <button
                      className="btn btn-icon"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="cart-qty">
                      {item.quantity}
                    </span>
                    <button
                      className="btn btn-icon"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-sidebar">
                  <p className="cart-item-subtotal">
                    Zwischensumme:{" "}
                    <strong>
                      {(Number(item.price) * item.quantity).toFixed(2)} €
                    </strong>
                  </p>
                  <button
                    className="btn btn-secondary"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Entfernen
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <div className="card">
              <h3>Bestellübersicht</h3>
              <p>
                Artikel insgesamt:{" "}
                <strong>
                  {cartItems.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  )}
                </strong>
              </p>
              <p className="cart-summary-total">
                Gesamt:{" "}
                <strong>{totalPrice.toFixed(2)} €</strong>
              </p>

              <button
                className="btn btn-primary btn-block"
                onClick={handleGoToCheckout}
              >
                Zur Kasse
              </button>

              <Link
                to="/"
                className="btn btn-link btn-block cart-back-link"
              >
                ← Weiter einkaufen
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

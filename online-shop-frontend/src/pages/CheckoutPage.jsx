import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function CheckoutPage({ cartItems, authUser, onOrderCompleted }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("INVOICE"); // INVOICE, CARD, PAYPAL
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  useEffect(() => {
    if (!authUser) {
      navigate("/login");
      return;
    }
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    const loadAddresses = async () => {
      setLoadingAddresses(true);
      setError("");
      try {
        const resp = await fetch("http://localhost:9090/api/addresses", {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        });
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Fehler beim Laden der Adressen");
        }
        const data = await resp.json();
        const list = Array.isArray(data) ? data : [];
        setAddresses(list);
        const defaultAddress = list.find((a) => a.defaultAddress);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (list.length > 0) {
          setSelectedAddressId(list[0].id);
        }
      } catch (err) {
        setError(err.message || "Unbekannter Fehler beim Laden");
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [authUser, cartItems, navigate]);

  const handleNext = () => {
    if (step === 1 && !selectedAddressId) {
      alert("Bitte wähle eine Lieferadresse oder lege eine neue an.");
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    setError("");

    try {
      const customerName = authUser.name || authUser.email;
      const customerEmail = authUser.email;

      const orderRequest = {
        customerName,
        customerEmail,
        addressId: selectedAddressId,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const resp = await fetch("http://localhost:9090/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser.token}`,
        },
        body: JSON.stringify(orderRequest),
      });

      const text = await resp.text();

      if (!resp.ok) {
        throw new Error(text || "Fehler beim Absenden der Bestellung");
      }

      const data = JSON.parse(text);
      if (onOrderCompleted) {
        onOrderCompleted(data.id);
      }
    } catch (err) {
      setError(err.message || "Unbekannter Fehler beim Bestellen");
    } finally {
      setSubmitting(false);
    }
  };

  const currentAddress =
    addresses.find((a) => a.id === selectedAddressId) || null;

  return (
    <div>
      <div className="page-header">
        <h2>Checkout</h2>
        <p className="subheading">
          Schritt {step} von 3 – Lieferadresse, Zahlungsmethode & Bestellübersicht für HSIG Onlineshopping.
        </p>
      </div>

      {/* Schrittanzeige */}
      <div className="checkout-steps card">
        <div className={"checkout-step" + (step >= 1 ? " active" : "")}>
          <div className="checkout-step-number">1</div>
          <div className="checkout-step-label">Adresse</div>
        </div>
        <div className={"checkout-step" + (step >= 2 ? " active" : "")}>
          <div className="checkout-step-number">2</div>
          <div className="checkout-step-label">Zahlung</div>
        </div>
        <div className={"checkout-step" + (step >= 3 ? " active" : "")}>
          <div className="checkout-step-number">3</div>
          <div className="checkout-step-label">Übersicht</div>
        </div>
      </div>

      {error && (
        <p className="info-text error" style={{ marginTop: "0.6rem" }}>
          Fehler: {error}
        </p>
      )}

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* STEP 1: Adressen */}
          {step === 1 && (
            <div className="card">
              <h3 className="section-title">Lieferadresse wählen</h3>
              {loadingAddresses && (
                <p className="info-text">Adressen werden geladen…</p>
              )}
              {!loadingAddresses && addresses.length === 0 && (
                <p className="info-text">
                  Du hast noch keine Adresse gespeichert. Lege unter{" "}
                  <Link to="/addresses">„Adressen“</Link> eine neue an.
                </p>
              )}
              {!loadingAddresses && addresses.length > 0 && (
                <div className="checkout-address-list">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={
                        "checkout-address-option" +
                        (selectedAddressId === address.id ? " selected" : "")
                      }
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      <div>
                        <div className="address-name">
                          {address.firstName} {address.lastName}{" "}
                          {address.defaultAddress && (
                            <span className="address-badge-default">
                              Standard
                            </span>
                          )}
                        </div>
                        <div className="address-line">{address.street}</div>
                        <div className="address-line">
                          {address.postalCode} {address.city}
                        </div>
                        <div className="address-line">{address.country}</div>
                        {address.additionalInfo && (
                          <div className="address-line address-additional">
                            {address.additionalInfo}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <p className="form-hint" style={{ marginTop: "0.5rem" }}>
                Du kannst Adressen im Bereich „Adressen“ verwalten.
              </p>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="card">
              <h3 className="section-title">Zahlungsmethode</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="INVOICE"
                    checked={paymentMethod === "INVOICE"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <div className="payment-title">Rechnung</div>
                    <div className="payment-desc">
                      Zahlung auf Rechnung – ideal für das Projekt.
                    </div>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <div className="payment-title">Kreditkarte (Demo)</div>
                    <div className="payment-desc">
                      Nur zu Demonstrationszwecken – keine echte Zahlung.
                    </div>
                  </div>
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="PAYPAL"
                    checked={paymentMethod === "PAYPAL"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <div className="payment-title">PayPal (Demo)</div>
                    <div className="payment-desc">
                      Simulierte PayPal-Zahlung für HSIG Onlineshopping.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Übersicht */}
          {step === 3 && (
            <div className="card">
              <h3 className="section-title">Bestellübersicht</h3>

              <h4>Artikel</h4>
              <div className="checkout-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="checkout-item-row">
                    <div>
                      <div className="checkout-item-name">{item.name}</div>
                      <div className="checkout-item-qty">
                        Menge: {item.quantity}
                      </div>
                    </div>
                    <div className="checkout-item-total">
                      {(Number(item.price) * item.quantity).toFixed(2)} €
                    </div>
                  </div>
                ))}
              </div>

              <h4 style={{ marginTop: "1rem" }}>Lieferadresse</h4>
              {currentAddress ? (
                <div className="checkout-summary-box">
                  <div className="address-name">
                    {currentAddress.firstName} {currentAddress.lastName}
                  </div>
                  <div className="address-line">
                    {currentAddress.street}
                  </div>
                  <div className="address-line">
                    {currentAddress.postalCode} {currentAddress.city}
                  </div>
                  <div className="address-line">
                    {currentAddress.country}
                  </div>
                  {currentAddress.additionalInfo && (
                    <div className="address-line address-additional">
                      {currentAddress.additionalInfo}
                    </div>
                  )}
                </div>
              ) : (
                <p className="info-text">
                  Keine Adresse ausgewählt (zurück zu Schritt 1).
                </p>
              )}

              <h4 style={{ marginTop: "1rem" }}>Zahlung</h4>
              <div className="checkout-summary-box">
                {paymentMethod === "INVOICE" && "Rechnung"}
                {paymentMethod === "CARD" && "Kreditkarte (Demo)"}
                {paymentMethod === "PAYPAL" && "PayPal (Demo)"}
              </div>
            </div>
          )}
        </div>

        {/* Rechte Spalte: Gesamtsumme + Buttons */}
        <aside className="checkout-sidebar">
          <div className="card">
            <h3 className="section-title">Gesamtbetrag</h3>
            <p>
              Zwischensumme:{" "}
              <strong>{totalPrice.toFixed(2)} €</strong>
            </p>
            <p className="form-hint">
              (Alle Preise sind Demo-Preise für das HSIG-Projekt 😉)
            </p>

            <div className="checkout-actions">
              {step > 1 && (
                <button
                  className="btn btn-secondary btn-block"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  Zurück
                </button>
              )}

              {step < 3 && (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleNext}
                  disabled={submitting}
                >
                  Weiter
                </button>
              )}

              {step === 3 && (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                >
                  {submitting
                    ? "Bestellung wird gesendet..."
                    : "Jetzt kostenpflichtig bestellen"}
                </button>
              )}

              <Link to="/cart" className="btn btn-link btn-block">
                ← Zurück zum Warenkorb
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

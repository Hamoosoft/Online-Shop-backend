import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function ProductDetailsPage({ onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const resp = await fetch(`http://localhost:9090/api/products/${id}`);
        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(text || "Produkt konnte nicht geladen werden");
        }
        const data = await resp.json();
        setProduct(data);
      } catch (err) {
        setError(err.message || "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCartClick = () => {
    if (product && onAddToCart) {
      onAddToCart(product);
    }
  };

  if (loading) {
    return <p className="info-text">Produkt wird geladen…</p>;
  }

  if (error) {
    return (
      <div className="card">
        <p className="info-text error">Fehler: {error}</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Zurück
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="card">
        <p className="info-text">Kein Produkt gefunden.</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Zurück
        </button>
      </div>
    );
  }

  const price = Number(product.price || 0).toFixed(2);

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="product-detail-breadcrumb">
        <Link to="/" className="link-muted">
          Start
        </Link>
        <span>›</span>
        <Link to="/products" className="link-muted">
          Produkte
        </Link>
        <span>›</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail-layout card">
        {/* Bildbereich */}
        <div className="product-detail-image-wrap">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-detail-image"
            />
          ) : (
            <div className="product-detail-placeholder">
              Kein Bild vorhanden
            </div>
          )}
        </div>

        {/* Info-Bereich */}
        <div className="product-detail-info">
          <h2 className="product-detail-title">{product.name}</h2>

          <div className="product-detail-meta">
            <span className="product-detail-badge">
              HSIG Onlineshopping
            </span>
            {product.category && (
              <span className="product-detail-badge secondary">
                Kategorie: {product.category}
              </span>
            )}
          </div>

          <p className="product-detail-description">
            {product.description || "Keine Beschreibung vorhanden."}
          </p>

          <div className="product-detail-bottom">
            <div className="product-detail-price-block">
              <span className="product-detail-price">{price} €</span>
              {product.stock != null && (
                <span className="product-detail-stock">
                  {product.stock > 0
                    ? `${product.stock} Stück verfügbar`
                    : "Aktuell nicht verfügbar"}
                </span>
              )}
            </div>

            <div className="product-detail-actions">
              <button
                className="btn btn-primary"
                onClick={handleAddToCartClick}
                disabled={product.stock === 0}
              >
                In den Warenkorb
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                Zurück
              </button>
            </div>
          </div>

          {/* Optional: technische Details / Eigenschaften, falls vorhanden */}
          {(product.brand || product.sku) && (
            <div className="product-detail-extra">
              {product.brand && (
                <div className="product-detail-extra-row">
                  <span>Marke</span>
                  <span>{product.brand}</span>
                </div>
              )}
              {product.sku && (
                <div className="product-detail-extra-row">
                  <span>Artikel-Nr.</span>
                  <span>{product.sku}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

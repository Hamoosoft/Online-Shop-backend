import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function ProductList({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Produkte vom Backend laden
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Fehler beim Laden der Produkte");
        }
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Debounce (kleine Pause beim Tippen)
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  const normalize = (t) => (t || "").toString().toLowerCase();

  // Gefilterte Produkte
  const filteredProducts = useMemo(() => {
    if (!debouncedQuery) return products;

    const q = normalize(debouncedQuery);
    const tokens = q.split(/\s+/).filter(Boolean);

    return products
      .map((p) => {
        const name = normalize(p.name);
        const desc = normalize(p.description);
        let score = 0;

        tokens.forEach((t) => {
          if (name.includes(t)) score += 3;
          if (desc.includes(t)) score += 1;
        });

        return { product: p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.product);
  }, [products, debouncedQuery]);

  // Autocomplete-Vorschläge (nur Name)
  const suggestions = useMemo(() => {
    const term = normalize(searchInput);
    if (!term || term.length < 2) return [];
    return products
      .filter((p) => normalize(p.name).includes(term))
      .slice(0, 8);
  }, [products, searchInput]);

  const handleSuggestionClick = (name) => {
    setSearchInput(name);
    setDebouncedQuery(name);
  };

  // Highlight im Vorschlag
  const highlight = (text) => {
    const q = searchInput.trim();
    if (!q) return text;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q.toLowerCase());
    if (idx === -1) return text;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);

    return (
      <>
        {before}
        <mark>{match}</mark>
        {after}
      </>
    );
  };

  const totalCount = products.length;
  const visibleCount = debouncedQuery ? filteredProducts.length : totalCount;

  return (
    <div>
      <div className="page-header">
        <h2>Produkte</h2>
        <p className="subheading">
          Gib einen Suchbegriff ein – wir filtern die Produkte live.
        </p>
      </div>

      {/* Suchbereich */}
      <div className="search-card">
        <div className="search-layout">
          <div className="search-box">
            <div className="search-input-wrapper">
              <span className="search-input-icon">🔍</span>
              <input
                type="text"
                className="search-input-field"
                placeholder="Produkte suchen (z.B. Laptop, Maus, Kopfhörer)…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="search-input-clear"
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedQuery("");
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Autocomplete */}
            {suggestions.length > 0 && (
              <div className="search-dropdown">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="search-dropdown-item"
                    onClick={() => handleSuggestionClick(s.name)}
                  >
                    {highlight(s.name)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="search-info">
            {loading ? (
              <span>Produkte werden geladen…</span>
            ) : (
              <span>
                {visibleCount} von {totalCount} Produkten
                {debouncedQuery && (
                  <> für „<strong>{debouncedQuery}</strong>“</>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {error && <p className="info-text error">Fehler: {error}</p>}

      {/* Produktliste */}
      {!loading && !error && (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card-inner">
                <div className="product-image-wrap">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                    />
                  ) : (
                    <div className="product-placeholder">
                      Kein Bild vorhanden
                    </div>
                  )}
                </div>

                <div className="product-body">
                  <h3 className="product-title">
                    <Link to={`/products/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <p className="product-description">
                    {product.description}
                  </p>
                </div>

                <div className="product-footer">
                  <div className="product-price-block">
                    <span className="product-price">
                      {Number(product.price).toFixed(2)} €
                    </span>
                  </div>
                  <div className="product-actions">
                    <button className="btn btn-secondary product-btn-details">
                      <Link
                        to={`/products/${product.id}`}
                        className="product-details-link"
                      >
                        Details
                      </Link>
                    </button>
                    <button
                      className="btn btn-primary product-btn-cart"
                      onClick={() => onAddToCart(product)}
                    >
                      In den Warenkorb
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && !loading && !error && (
            <p className="info-text">
              Keine passenden Produkte gefunden. Bitte Suchbegriff ändern.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

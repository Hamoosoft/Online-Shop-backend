import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import ProductList from "./pages/ProductList.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import CartPage from "./pages/CartPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import OrderSuccessPage from "./pages/OrderSuccessPage.jsx";
import AddressesPage from "./pages/AddressesPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";

// NEU:
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminProductsPage from "./pages/AdminProductsPage.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [authUser, setAuthUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem("authUser");
    if (stored) {
      try {
        setAuthUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleLoginSuccess = (authResponse) => {
    const user = {
      token: authResponse.token,
      email: authResponse.email,
      name: authResponse.name,
      role: authResponse.role, // wichtig für Admin
    };
    setAuthUser(user);
    localStorage.setItem("authUser", JSON.stringify(user));
    navigate("/");
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem("authUser");
    navigate("/");
  };

  const handleOrderCompleted = (orderId) => {
    setCartItems([]);
    navigate(`/order-success/${orderId}`);
  };

  const isAdmin = authUser && authUser.role === "ADMIN";

  return (
    <div className="app-root">
      <header className="app-header">
        <nav className="navbar">
          {/* Brand links */}
          <div className="navbar-left">
            <Link to="/" className="navbar-brand">
              <span className="brand-badge">HSIG</span>
              <span className="brand-text">Onlineshopping</span>
            </Link>
          </div>

          {/* Haupt-Navigation in der Mitte */}
          <div className="navbar-center">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                "nav-tab" + (isActive ? " active" : "")
              }
            >
              <span className="nav-tab-icon">🛒</span>
              Produkte
            </NavLink>

            {authUser && (
              <>
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    "nav-tab" + (isActive ? " active" : "")
                  }
                >
                  <span className="nav-tab-icon">📦</span>
                  Bestellungen
                </NavLink>
                <NavLink
                  to="/addresses"
                  className={({ isActive }) =>
                    "nav-tab" + (isActive ? " active" : "")
                  }
                >
                  <span className="nav-tab-icon">📍</span>
                  Adressen
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    "nav-tab" + (isActive ? " active" : "")
                  }
                >
                  <span className="nav-tab-icon">👤</span>
                  Mein Profil
                </NavLink>
              </>
            )}

            {/* Admin-Tab nur für ADMIN */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  "nav-tab" + (isActive ? " active" : "")
                }
              >
                <span className="nav-tab-icon">🛠</span>
                Admin
              </NavLink>
            )}
          </div>

          {/* Rechts: Login/Logout + Warenkorb */}
          <div className="navbar-right">
            {authUser ? (
              <div className="nav-auth-user">
                <span className="nav-user-badge">
                  👤 {authUser.name || authUser.email}
                </span>
                <button
                  className="btn btn-link nav-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="nav-auth-tabs">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    "auth-tab" + (isActive ? " active" : "")
                  }
                >
                  Einloggen
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    "auth-tab" + (isActive ? " active" : "")
                  }
                >
                  Registrieren
                </NavLink>
              </div>
            )}

            <Link to="/cart" className="nav-cart">
              🧺
              {totalItemsCount > 0 && (
                <span className="cart-badge">{totalItemsCount}</span>
              )}
            </Link>
          </div>
        </nav>

        {/* Hero NUR auf der Startseite "/" */}
        {location.pathname === "/" && (
          <div className="hero">
            <div className="hero-content">
              <span className="hero-chip">HSIG Projekt · Online-Shop</span>
              <h1>Willkommen bei HSIG Onlineshopping</h1>
              <p>
                Online-Shop Projekt der HSIG: Produkte ansehen, in den
                Warenkorb legen, bestellen und Bestellungen verwalten.
              </p>
              <div className="hero-buttons">
                <Link to="/" className="btn btn-primary hero-main-btn">
                  Produkte entdecken
                </Link>
                {authUser && (
                  <Link to="/orders" className="btn btn-secondary">
                    Meine Bestellungen
                  </Link>
                )}
              </div>

              <div className="hero-stats">
                
                <div className="hero-stat-card">
                  <div className="hero-stat-icon">🔐</div>
                  <div className="hero-stat-title">Benutzerkonten</div>
                  <div className="hero-stat-text">
                    Registrierung, Login, Profil & Adressverwaltung.
                  </div>
                </div>
                <div className="hero-stat-card">
                  <div className="hero-stat-icon">🧾</div>
                  <div className="hero-stat-title">Bestellungen</div>
                  <div className="hero-stat-text">
                    Warenkorb, Checkout, Bestellübersicht mit Status.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="main-content">
        <div className="container">
          <Routes>
            <Route
              path="/"
              element={<ProductList onAddToCart={addToCart} />}
            />
            <Route
              path="/products/:id"
              element={<ProductDetail onAddToCart={addToCart} />}
            />
            <Route
              path="/cart"
              element={
                <CartPage
                  cartItems={cartItems}
                  removeFromCart={removeFromCart}
                  updateQuantity={updateQuantity}
                  authUser={authUser}
                />
              }
            />
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  cartItems={cartItems}
                  authUser={authUser}
                  onOrderCompleted={handleOrderCompleted}
                />
              }
            />
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
            />
            <Route
              path="/register"
              element={
                <RegisterPage onRegisterSuccess={handleLoginSuccess} />
              }
            />
            <Route
              path="/profile"
              element={<ProfilePage authUser={authUser} />}
            />
            <Route
              path="/addresses"
              element={<AddressesPage authUser={authUser} />}
            />
            <Route
              path="/orders"
              element={<OrdersPage authUser={authUser} />}
            />
            <Route
              path="/order-success/:orderId"
              element={<OrderSuccessPage authUser={authUser} />}
            />

            {/* Admin-Routen – nur sinnvoll, wenn isAdmin true */}
            <Route
              path="/admin"
              element={<AdminDashboardPage authUser={authUser} />}
            />
            <Route
              path="/admin/products"
              element={<AdminProductsPage authUser={authUser} />}
            />
            <Route
              path="/admin/orders"
              element={<AdminOrdersPage authUser={authUser} />}
            />
          </Routes>
        </div>
      </main>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} HSIG Onlineshopping – Gruppenprojekt
        </p>
      </footer>
    </div>
  );
}

export default App;

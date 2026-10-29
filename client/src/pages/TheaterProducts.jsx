import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const CATEGORY_LABELS = {
  all: "All",
  food: "🍔 Food",
  beverage: "🥤 Beverages",
  snack: "🍿 Snacks",
  combo: "🎁 Combos",
  merchandise: "👕 Merch",
};

function TheaterProducts() {
  const { theaterId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [theater, setTheater] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState({});
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");
  const [orderError, setOrderError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      api.get(`/theater-products/theater/${theaterId}`),
      api.get(`/theaters/${theaterId}`),
    ])
      .then(([prodRes, theaterRes]) => {
        setProducts(prodRes.data.products || []);
        setTheater(theaterRes.data.theater);
      })
      .catch(() => setError("Could not load products for this theater."))
      .finally(() => setLoading(false));
  }, [theaterId]);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [products, categoryFilter]);

  const updateCart = (productId, delta) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: next };
    });
  };

  const cartItems = products.filter((p) => cart[p._id] > 0);
  const cartTotal = cartItems.reduce((sum, p) => sum + p.price * cart[p._id], 0);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const placeOrder = async () => {
    if (!token) {
      navigate("/login", { state: { from: { pathname: `/theaters/${theaterId}/products` } } });
      return;
    }
    if (cartItems.length === 0) return;
    setOrdering(true);
    setOrderError("");
    setOrderSuccess("");
    try {
      const items = cartItems.map((p) => ({ productId: p._id, quantity: cart[p._id] }));
      await api.post("/orders", { theaterId, items, deliveryType: "counter" });
      setCart({});
      setOrderSuccess("🎉 Order placed! Pick up at the counter. Check 'My Orders' for details.");
    } catch (err) {
      setOrderError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <main className="container py-5">
        <div className="product-grid">
          {[1, 2, 3, 4, 6, 8].map((n) => (
            <div className="skeleton" key={n} style={{ minHeight: 260, borderRadius: 16 }} />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/theaters" className="btn btn-glass">← Back to Theaters</Link>
      </main>
    );
  }

  return (
    <main className="container py-5 page-enter">
      <Link to="/theaters" className="section-link mb-3" style={{ display: "inline-block" }}>
        ← All Theaters
      </Link>

      <header className="mb-4 mt-2">
        <p className="hero-eyebrow mb-2">🍿 FOOD & BEVERAGES</p>
        <h1 className="fw-bold mb-1">{theater?.name || "Theater"}</h1>
        <p className="text-secondary mb-0">📍 {theater?.location}</p>
      </header>

      {orderSuccess && <div className="alert alert-success">{orderSuccess}</div>}
      {orderError && <div className="alert alert-danger">{orderError}</div>}

      <div className="product-category-filter mb-3">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            className={`category-chip ${categoryFilter === key ? "active" : ""}`}
            onClick={() => setCategoryFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="products-page-layout">
        {/* Products grid */}
        <div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <p className="mb-0">No products in this category.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((product) => {
                const qty = cart[product._id] || 0;
                return (
                  <div className="product-card" key={product._id}>
                    <img
                      className="product-card-img"
                      src={product.image || `https://picsum.photos/seed/${product._id}/400/300`}
                      alt={product.name}
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.name}/400/300`; }}
                    />
                    <div className="product-card-body">
                      <span className={`product-category-badge badge-${product.category}`}>
                        {product.category}
                      </span>
                      <div className="product-name">{product.name}</div>
                      <div className="product-desc">{product.description}</div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="product-price">₹{product.price}</div>
                        <div className="product-qty-controls">
                          {qty > 0 ? (
                            <>
                              <button className="qty-btn" onClick={() => updateCart(product._id, -1)}>−</button>
                              <span className="qty-display">{qty}</span>
                              <button className="qty-btn" onClick={() => updateCart(product._id, 1)}>+</button>
                            </>
                          ) : (
                            <button
                              className="btn btn-premium btn-xs"
                              style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                              onClick={() => updateCart(product._id, 1)}
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                      {product.stock < 10 && (
                        <p className="small text-danger mt-1 mb-0">Only {product.stock} left!</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart sidebar */}
        <aside className="cart-sidebar">
          <p className="hero-eyebrow mb-3">🛒 YOUR CART ({cartCount} items)</p>

          {cartItems.length === 0 ? (
            <p className="text-secondary small">Add items from the menu to start your order.</p>
          ) : (
            <>
              {cartItems.map((p) => (
                <div className="cart-item" key={p._id}>
                  <span className="cart-item-name">
                    {p.name}
                    <span className="text-secondary"> × {cart[p._id]}</span>
                  </span>
                  <span className="cart-item-price">₹{(p.price * cart[p._id]).toFixed(0)}</span>
                  <button
                    onClick={() => setCart((prev) => { const { [p._id]: _, ...rest } = prev; return rest; })}
                    style={{ background: "none", border: "none", color: "#ff8b9c", cursor: "pointer", fontSize: "0.8rem", padding: 0, marginLeft: 4 }}
                    aria-label={`Remove ${p.name} from cart`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="divider" />
              <div className="cart-total-row">
                <span>Total</span>
                <strong>₹{cartTotal.toFixed(0)}</strong>
              </div>
              <button
                className="btn btn-premium w-100 mt-3"
                disabled={ordering}
                onClick={placeOrder}
                id="place-order-btn"
              >
                {ordering ? "Placing Order…" : token ? "Place Order 🎬" : "Login to Order"}
              </button>
              <button
                className="btn btn-glass w-100 mt-2"
                onClick={() => setCart({})}
              >
                Clear Cart
              </button>
              <p className="payment-disclaimer mt-3 mb-0 text-center">
                Demo mode — no real payment charged.
              </p>
            </>
          )}

          {!token && (
            <div className="alert alert-info mt-3 mb-0" style={{ fontSize: "0.82rem" }}>
              <Link to="/login" className="text-gradient" style={{ fontWeight: 700 }}>Login</Link> to place orders and track them in My Orders.
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

export default TheaterProducts;

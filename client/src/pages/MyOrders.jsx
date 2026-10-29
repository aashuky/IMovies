import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const STATUS_CLASS = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  preparing: "status-preparing",
  ready: "status-ready",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
};

const STATUS_ICON = {
  pending: "⏳",
  confirmed: "✅",
  preparing: "👨‍🍳",
  ready: "🎉",
  delivered: "🚀",
  cancelled: "❌",
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState("");

  useEffect(() => {
    api.get("/orders/my")
      .then((res) => setOrders(res.data.orders || []))
      .catch(() => setError("Could not load your orders."))
      .finally(() => setLoading(false));
  }, []);

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.order : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel order.");
    } finally {
      setCancelling("");
    }
  };

  return (
    <main className="container py-5 page-enter">
      <header className="mb-4">
        <p className="hero-eyebrow mb-2">🛒 FOOD & DRINKS ORDERS</p>
        <h1 className="fw-bold mb-2">My Orders</h1>
        <p className="text-secondary mb-0">Track your food and beverage orders from theaters.</p>
      </header>

      {loading && <p className="text-secondary">Loading orders…</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🍿</div>
          <h3>No orders yet</h3>
          <p className="text-secondary mb-3">
            Browse theaters to order food & beverages for your movie experience.
          </p>
          <Link to="/theaters" className="btn btn-premium">
            Explore Theaters
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
              <div>
                <p className="hero-eyebrow mb-1">ORDER #{order._id.slice(-8).toUpperCase()}</p>
                <h2 className="h5 mb-1">{order.theaterId?.name || "Theater"}</h2>
                <p className="text-secondary small mb-0">
                  📍 {order.theaterId?.location} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className={`order-status-badge ${STATUS_CLASS[order.status] || ""}`}>
                  {STATUS_ICON[order.status]} {order.status}
                </span>
                <span className={`order-status-badge ${order.paymentStatus === "paid" ? "status-confirmed" : "status-pending"}`}>
                  {order.paymentStatus === "paid" ? "💰 Paid" : "💸 Unpaid"}
                </span>
              </div>
            </div>

            <div className="order-items-list">
              {order.items.map((item, idx) => (
                <div className="order-item-row" key={idx}>
                  <strong>{item.name}</strong>
                  <span>
                    ₹{item.price} × {item.quantity} = <strong>₹{(item.price * item.quantity).toFixed(0)}</strong>
                  </span>
                </div>
              ))}
            </div>

            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <span className="text-secondary small">Delivery: </span>
                <strong className="small" style={{ textTransform: "capitalize" }}>
                  {order.deliveryType === "seat" ? `🪑 Seat ${order.seatNumber}` : "🏪 Counter Pickup"}
                </strong>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div>
                  <span className="text-secondary small">Total: </span>
                  <strong style={{ fontSize: "1.1rem" }}>₹{order.totalAmount?.toFixed(0)}</strong>
                </div>
                {["pending", "confirmed"].includes(order.status) && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    disabled={cancelling === order._id}
                    onClick={() => cancelOrder(order._id)}
                  >
                    {cancelling === order._id ? "Cancelling…" : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default MyOrders;

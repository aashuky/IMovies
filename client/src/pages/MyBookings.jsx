import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";

const STATUS_CLASS = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  cancelled: "status-cancelled",
};

const PAYMENT_CLASS = {
  pending: "status-pending",
  paid: "status-confirmed",
  failed: "status-cancelled",
  refunded: "status-preparing",
};

function MyBookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState("");

  useEffect(() => {
    api.get("/bookings/my")
      .then((res) => setBookings(res.data.bookings || []))
      .catch((err) => setError(err.response?.data?.message || "Could not load your bookings."))
      .finally(() => setLoading(false));
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking? If paid, it will be refunded.")) return;
    setCancelling(bookingId);
    try {
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) => b._id === bookingId ? { ...b, status: res.data.booking.status, paymentStatus: res.data.booking.paymentStatus } : b)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel booking.");
    } finally {
      setCancelling("");
    }
  };

  return (
    <main className="container py-5 page-enter">
      <header className="mb-4">
        <p className="hero-eyebrow mb-2">🎟️ MY TICKETS</p>
        <h1 className="fw-bold mb-2">My Bookings</h1>
        <p className="text-secondary mb-0">View all your movie ticket bookings and their status.</p>
      </header>

      {location.state?.message && (
        <div className="alert alert-success">{location.state.message}</div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[1, 2, 3].map((n) => (
            <div className="skeleton" key={n} style={{ minHeight: 150, borderRadius: 16 }} />
          ))}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎬</div>
          <h3>No bookings yet</h3>
          <p className="text-secondary mb-3">
            Book your first movie ticket and it'll appear here.
          </p>
          <Link to="/movies" className="btn btn-premium">
            Explore Movies
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {bookings.map((booking) => {
          const movie = booking.showId?.movieId;
          const theater = booking.showId?.theaterId;
          const show = booking.showId;
          const isCancelled = booking.status === "cancelled";
          const isPaid = booking.paymentStatus === "paid";

          return (
            <div
              className="booking-card"
              key={booking._id}
              style={{ opacity: isCancelled ? 0.7 : 1 }}
            >
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  {movie?.poster && (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      style={{ width: 52, height: 70, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                    />
                  )}
                  <div>
                    <p className="hero-eyebrow mb-1">CINEMA BOOKING</p>
                    <h2 className="h4 mb-1">{movie?.title || "Movie"}</h2>
                    <p className="text-secondary small mb-0">
                      🎭 {theater?.name || "Theater"} · 📍 {theater?.location}
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <span className={`order-status-badge ${PAYMENT_CLASS[booking.paymentStatus] || "status-pending"}`}>
                    {isPaid ? "💰 Paid" : booking.paymentStatus === "refunded" ? "🔄 Refunded" : "⏳ Pending"}
                  </span>
                  <span className={`order-status-badge ${STATUS_CLASS[booking.status] || "status-pending"}`}>
                    {booking.status === "confirmed" ? "✅" : booking.status === "cancelled" ? "❌" : "⏳"} {booking.status}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "📅 Show Date", value: show?.showDate ? new Date(show.showDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—" },
                  { label: "⏰ Show Time", value: show?.showTime || "—" },
                  { label: "🪑 Seats", value: booking.seats?.join(", ") || "—" },
                  { label: "💺 Screen", value: `Screen ${show?.screenNumber || "?"}` },
                  { label: "💰 Total", value: `₹${Number(booking.totalAmount || 0).toFixed(0)}` },
                  { label: "📅 Booked On", value: new Date(booking.createdAt).toLocaleDateString("en-IN") },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <div className="text-secondary" style={{ fontSize: "0.74rem", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="d-flex gap-3 align-items-center flex-wrap">
                {movie && (
                  <Link to={`/movies/${movie._id}`} className="btn btn-glass btn-sm">
                    View Movie
                  </Link>
                )}
                {!isCancelled && booking.status !== "confirmed" && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    disabled={cancelling === booking._id}
                    onClick={() => cancelBooking(booking._id)}
                  >
                    {cancelling === booking._id ? "Cancelling…" : "Cancel Booking"}
                  </button>
                )}
                {isCancelled && (
                  <span className="text-secondary small">This booking has been cancelled.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default MyBookings;

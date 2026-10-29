import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import api from "../services/api";

const fetchShowData = (showId) =>
  Promise.all([
    api.get(`/bookings/show/${showId}/seats`),
    api.get(`/shows/${showId}`),
  ]);

// ── helpers ────────────────────────────────────────────────────────────────
function buildUpiString({ amount, bookingId, movieTitle }) {
  // Real UPI deep-link format – scans like a genuine payment QR
  // Using a demo merchant VPA so it looks authentic but no money moves
  const vpa = "imovies.demo@upi";
  const name = encodeURIComponent("iMovies Cinema");
  const note = encodeURIComponent(
    `Ticket: ${movieTitle || "Movie"} | Ref: ${bookingId.slice(-8).toUpperCase()}`
  );
  const am = Number(amount).toFixed(2);
  return `upi://pay?pa=${vpa}&pn=${name}&am=${am}&cu=INR&tn=${note}`;
}

function buildUpiQrLabel({ seats, amount, bookingId }) {
  return `Booking #${bookingId.slice(-8).toUpperCase()} · Seats ${seats.join(", ")} · ₹${Number(amount).toFixed(2)}`;
}

// ── component ──────────────────────────────────────────────────────────────
function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [pendingBookingId, setPendingBookingId] = useState("");
  const [reservationExpiresAt, setReservationExpiresAt] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [paymentTab, setPaymentTab] = useState("upi"); // upi | card | demo
  const [paySuccess, setPaySuccess] = useState(false);
  const [justAdded, setJustAdded] = useState(null); // for seat-add animation
  const timerRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [seatResponse, showResponse] = await fetchShowData(showId);
      setSeats(seatResponse.data.seats || []);
      setShow(showResponse.data.show);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load this show.");
    } finally {
      setLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    let active = true;
    fetchShowData(showId)
      .then(([seatResponse, showResponse]) => {
        if (!active) return;
        setSeats(seatResponse.data.seats || []);
        setShow(showResponse.data.show);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || "Could not load this show.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [showId]);

  // Countdown timer
  useEffect(() => {
    if (!pendingBookingId || !reservationExpiresAt) return undefined;
    const update = () => {
      const secs = Math.max(
        0,
        Math.ceil((new Date(reservationExpiresAt).getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(secs);
    };
    update();
    timerRef.current = window.setInterval(update, 1000);
    return () => window.clearInterval(timerRef.current);
  }, [pendingBookingId, reservationExpiresAt]);

  const toggleSeat = (seatNumber) => {
    if (pendingBookingId) return;
    setJustAdded(seatNumber);
    setTimeout(() => setJustAdded(null), 400);
    setSelected((curr) =>
      curr.includes(seatNumber)
        ? curr.filter((s) => s !== seatNumber)
        : [...curr, seatNumber]
    );
  };

  const reserveSeats = async () => {
    if (selected.length === 0) {
      setError("Choose at least one seat to continue.");
      return;
    }
    setProcessing(true);
    setError("");
    try {
      const bookingResponse = await api.post("/bookings", { showId, seats: selected });
      const bookingId = bookingResponse.data.booking?._id;
      if (!bookingId) throw new Error("The booking response did not include an ID.");
      setPendingBookingId(bookingId);
      setReservationExpiresAt(bookingResponse.data.expiresAt || "");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Could not reserve seats. Please try again."
      );
      await loadData();
    } finally {
      setProcessing(false);
    }
  };

  const confirmPayment = async () => {
    if (!pendingBookingId) return;
    setProcessing(true);
    setError("");
    try {
      await api.post(`/payments/demo/${pendingBookingId}`, { method: paymentTab === "upi" ? "upi" : paymentTab === "card" ? "card" : "demo" });
      setPaySuccess(true);
      setTimeout(() => {
        navigate("/bookings", {
          replace: true,
          state: { message: "🎉 Payment successful! Your seats are confirmed." },
        });
      }, 2200);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Payment failed. Please try again.";
      if (message.toLowerCase().includes("already been paid")) {
        navigate("/bookings", {
          replace: true,
          state: { message: "Your booking is already confirmed." },
        });
        return;
      }
      setError(message);
      if (message.toLowerCase().includes("reservation expired")) {
        setPendingBookingId("");
        setReservationExpiresAt("");
        setSelected([]);
        await loadData();
      }
    } finally {
      if (!paySuccess) setProcessing(false);
    }
  };

  const price = Number(show?.price || 0);
  const total = selected.length * price;
  const movie = show?.movieId;
  const theater = show?.theaterId;

  const upiString = pendingBookingId
    ? buildUpiString({ amount: total, bookingId: pendingBookingId, movieTitle: movie?.title })
    : "";

  const timerPct = reservationExpiresAt
    ? Math.max(0, (remainingSeconds / 600) * 100)
    : 100;
  const timerColor =
    remainingSeconds > 300
      ? "#4ade80"
      : remainingSeconds > 120
      ? "#fbbf24"
      : "#f87171";

  // ── loading / error states ───────────────────────────────────────────────
  if (loading) {
    return (
      <main className="container py-5">
        <div className="seat-loading-wrap">
          <div className="seat-loader" />
          <p className="text-secondary mt-3">Loading seat availability…</p>
        </div>
      </main>
    );
  }

  if (!show) {
    return (
      <main className="container py-5">
        <p className="text-danger">{error || "This show could not be found."}</p>
        <Link to="/movies" className="btn btn-glass">Browse movies</Link>
      </main>
    );
  }

  // ── success overlay ──────────────────────────────────────────────────────
  if (paySuccess) {
    return (
      <div className="pay-success-overlay">
        <div className="pay-success-card">
          <div className="pay-success-icon">✅</div>
          <h2>Payment Confirmed!</h2>
          <p>Redirecting to your bookings…</p>
          <div className="pay-success-bar" />
        </div>
      </div>
    );
  }

  // ── main render ──────────────────────────────────────────────────────────
  return (
    <main className="container py-5 page-enter">
      <Link to={`/movies/${movie?._id}/shows`} className="section-link">
        ← All showtimes
      </Link>

      <header className="seat-page-heading mt-3 mb-4">
        <p className="hero-eyebrow mb-2">YOUR CINEMA NIGHT</p>
        <h1 className="fw-bold mb-2">Choose your seats</h1>
        <p className="text-secondary mb-0">
          {movie?.title || "Movie"} · {theater?.name || "Cinema"} · Screen{" "}
          {show.screenNumber} · {show.showTime}
        </p>
      </header>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="seat-layout">
        {/* ── Seat picker ─────────────────────────────────────────────── */}
        <section className="seat-picker-panel" aria-label="Seat selection">
          <div className="seat-legend" aria-label="Seat availability legend">
            <span><i className="seat-legend-dot available" /> Available</span>
            <span><i className="seat-legend-dot selected" /> Selected</span>
            <span><i className="seat-legend-dot booked" /> Unavailable</span>
          </div>

          <div className="screen-indicator">
            <span className="screen-glow">SCREEN</span>
          </div>

          <div className="seat-grid">
            {seats.map((seat) => {
              const isBooked = seat.status === "booked";
              const isSelected = selected.includes(seat.seatNumber);
              const isNew = justAdded === seat.seatNumber;
              return (
                <button
                  key={seat.seatNumber}
                  type="button"
                  disabled={isBooked || processing || Boolean(pendingBookingId)}
                  onClick={() => toggleSeat(seat.seatNumber)}
                  aria-label={`${seat.seatNumber}, ${isBooked ? "unavailable" : isSelected ? "selected" : "available"}`}
                  aria-pressed={isSelected}
                  className={`seat ${isBooked ? "seat-unavailable" : ""} ${isSelected ? "seat-selected" : ""} ${isNew ? "seat-pop" : ""}`}
                >
                  {seat.seatNumber}
                </button>
              );
            })}
          </div>

          {seats.length === 0 && (
            <p className="text-secondary text-center">
              No seats are available for this show.
            </p>
          )}
        </section>

        {/* ── Booking sidebar ─────────────────────────────────────────── */}
        <aside className="booking-summary">
          <p className="hero-eyebrow mb-2">BOOKING SUMMARY</p>
          <h2 className="h4 mb-4">{movie?.title || "Your movie"}</h2>

          {/* Seat pills */}
          <div className="booking-summary-row">
            <span>Seats</span>
            <strong>
              {selected.length
                ? (
                  <div className="seat-pills">
                    {selected.map((s) => (
                      <span key={s} className="seat-pill-tag">{s}</span>
                    ))}
                  </div>
                )
                : "Choose seats"}
            </strong>
          </div>

          <div className="booking-summary-row">
            <span>Price per seat</span>
            <strong>₹{price.toFixed(2)}</strong>
          </div>

          <div className="booking-summary-total">
            <span>Total</span>
            <strong className="total-amount">₹{total.toFixed(2)}</strong>
          </div>

          {/* Reserve button */}
          {!pendingBookingId && (
            <>
              <button
                type="button"
                className="btn btn-premium w-100 mt-3"
                disabled={processing || selected.length === 0}
                onClick={reserveSeats}
              >
                {processing ? (
                  <span className="btn-spinner">
                    <span className="spinner-dot" /> Reserving seats…
                  </span>
                ) : (
                  "Reserve seats & pay →"
                )}
              </button>
              <button
                type="button"
                className="btn btn-glass w-100 mt-2"
                disabled={processing}
                onClick={loadData}
              >
                Refresh seats
              </button>
              <p className="payment-disclaimer mt-3 mb-0">
                Demo checkout only. No real money is collected.
              </p>
            </>
          )}

          {/* ── Payment panel ────────────────────────────────────────── */}
          {pendingBookingId && (
            <div className="demo-payment-panel mt-4">
              {/* Timer bar */}
              <div className="reservation-timer-wrap">
                <div className="reservation-timer-bar-track">
                  <div
                    className="reservation-timer-bar-fill"
                    style={{
                      width: `${timerPct}%`,
                      background: timerColor,
                      transition: "width 1s linear, background 0.5s ease",
                    }}
                  />
                </div>
                <p className="demo-expiry" style={{ color: timerColor }}>
                  {remainingSeconds > 0
                    ? `⏱ Seat hold: ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`
                    : "⚠️ Hold expired. Select seats again."}
                </p>
              </div>

              {remainingSeconds > 0 && (
                <>
                  {/* Payment method tabs */}
                  <div className="payment-tabs-row">
                    {[
                      { id: "upi", label: "📱 UPI", icon: "upi" },
                      { id: "card", label: "💳 Card", icon: "card" },
                      { id: "demo", label: "🚀 Demo", icon: "demo" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        className={`pay-tab-btn ${paymentTab === tab.id ? "active" : ""}`}
                        onClick={() => setPaymentTab(tab.id)}
                        type="button"
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* UPI tab */}
                  {paymentTab === "upi" && (
                    <div className="upi-payment-section">
                      <p className="hero-eyebrow mb-2">SCAN WITH ANY UPI APP</p>
                      <div className="qr-outer-frame">
                        <div className="qr-scan-anim" />
                        <div className="qr-white-bg">
                          <QRCodeSVG
                            value={upiString}
                            size={180}
                            level="M"
                            title="UPI payment QR"
                            includeMargin={false}
                          />
                        </div>
                      </div>
                      <p className="qr-hint-text">
                        {buildUpiQrLabel({ seats: selected, amount: total, bookingId: pendingBookingId })}
                      </p>
                      <p className="upi-apps-row">
                        <span className="upi-app-badge">GPay</span>
                        <span className="upi-app-badge">PhonePe</span>
                        <span className="upi-app-badge">Paytm</span>
                        <span className="upi-app-badge">BHIM</span>
                      </p>
                      <p className="payment-disclaimer mb-0">
                        ⚠ This is a demo QR. No real payment is processed.
                      </p>
                    </div>
                  )}

                  {/* Card tab */}
                  {paymentTab === "card" && (
                    <div className="card-payment-section">
                      <div className="fake-credit-card">
                        <div className="fake-card-chip" />
                        <div className="fake-card-num">•••• •••• •••• 4242</div>
                        <div className="fake-card-bottom">
                          <div>
                            <div className="fake-card-label">CARD HOLDER</div>
                            <div className="fake-card-val">DEMO USER</div>
                          </div>
                          <div>
                            <div className="fake-card-label">EXPIRES</div>
                            <div className="fake-card-val">12/26</div>
                          </div>
                          <div className="fake-card-brand">VISA</div>
                        </div>
                        <div className="fake-card-shimmer" />
                      </div>
                      <div className="card-form-row">
                        <div className="card-form-group">
                          <label className="card-form-label">Card Number</label>
                          <input className="card-form-input" defaultValue="4242 4242 4242 4242" readOnly />
                        </div>
                        <div className="card-form-group">
                          <label className="card-form-label">Expiry</label>
                          <input className="card-form-input" defaultValue="12/26" readOnly />
                        </div>
                        <div className="card-form-group">
                          <label className="card-form-label">CVV</label>
                          <input className="card-form-input" defaultValue="•••" readOnly />
                        </div>
                      </div>
                      <p className="payment-disclaimer">
                        ⚠ Demo card details. No charge is made.
                      </p>
                    </div>
                  )}

                  {/* Instant demo tab */}
                  {paymentTab === "demo" && (
                    <div className="demo-instant-section">
                      <div className="demo-icon-wrap">
                        <span className="demo-icon">⚡</span>
                      </div>
                      <h4>Instant demo payment</h4>
                      <p className="text-secondary">
                        Skip the UI — simulate a successful payment in one click.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-premium w-100 mt-3 pay-confirm-btn"
                    disabled={processing}
                    onClick={confirmPayment}
                  >
                    {processing ? (
                      <span className="btn-spinner">
                        <span className="spinner-dot" /> Processing…
                      </span>
                    ) : (
                      `✓ Confirm Payment  ₹${total.toFixed(2)}`
                    )}
                  </button>
                </>
              )}

              {remainingSeconds === 0 && (
                <button
                  type="button"
                  className="btn btn-glass w-100 mt-3"
                  onClick={() => {
                    setPendingBookingId("");
                    setReservationExpiresAt("");
                    setSelected([]);
                    loadData();
                  }}
                >
                  Choose seats again
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

export default SeatSelection;

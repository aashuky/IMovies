
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";

function MyBookings() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get("/bookings/my");
        setBookings(response.data.bookings || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load your bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">My Bookings</h1>

      {location.state?.message && (
        <p className="text-success">{location.state.message}</p>
      )}

      {loading && <p>Loading bookings...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <div>
          <p>You haven't booked any movies yet.</p>
          <Link to="/movies" className="btn btn-danger">
            Explore Movies
          </Link>
        </div>
      )}

      <div className="row g-3">
        {bookings.map((booking) => (
          <div className="col-12" key={booking._id}>
            <div className="card bg-dark text-white border-secondary">
              <div className="card-body">
                <h5>
                  {booking.showId?.movieId?.title || "Movie"}
                </h5>

                <p className="mb-1">
                  Theater: {booking.showId?.theaterId?.name || "Unavailable"}
                </p>

                <p className="mb-1">
                  Seats: {booking.seats?.join(", ")}
                </p>

                <p className="mb-1">
                  Amount: ₹{booking.totalAmount}
                </p>

                <p className="mb-0">
                  Booking: {booking.status} · Payment: {booking.paymentStatus}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default MyBookings;

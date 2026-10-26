
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const seats = Array.from({ length: 40 }, (_, i) => `S${i + 1}`);

function SeatSelection() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSeat = (seat) => {
    setSelectedSeats((current) =>
      current.includes(seat)
        ? current.filter((item) => item !== seat)
        : [...current, seat]
    );
  };

  const bookSeats = async () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/bookings", {
        showId,
        seats: selectedSeats,
      });

      navigate("/bookings", {
        state: { message: response.data.message },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <h2 className="fw-bold text-center">Select Your Seats</h2>
      <div className="screen-indicator my-4">SCREEN</div>

      <div className="seat-grid mb-4">
        {seats.map((seat) => (
          <button
            key={seat}
            type="button"
            className={`seat ${
              selectedSeats.includes(seat) ? "seat-selected" : ""
            }`}
            onClick={() => toggleSeat(seat)}
            aria-pressed={selectedSeats.includes(seat)}
          >
            {seat}
          </button>
        ))}
      </div>

      <p>Selected seats: {selectedSeats.join(", ") || "None"}</p>
      <p>Total selected: {selectedSeats.length}</p>

      {error && <p className="text-danger">{error}</p>}

      <button
        className="btn btn-danger"
        onClick={bookSeats}
        disabled={loading}
      >
        {loading ? "Booking..." : "Confirm Booking"}
      </button>

      <p className="text-secondary mt-3">
        Seat availability is not yet loaded from the server. This page currently
        shows sample seats for the interface.
      </p>
    </main>
  );
}

export default SeatSelection;

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function ShowSelection() {
  const { id: movieId } = useParams();
  const [shows, setShows] = useState([]);
  const [movieTitle, setMovieTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadShows = async () => {
      try {
        const [showsResponse, movieResponse] = await Promise.all([
          api.get("/shows"),
          api.get(`/movies/${movieId}`),
        ]);
        if (active) {
          setShows(
            (showsResponse.data.shows || []).filter(
              (show) =>
                (show.movieId?._id || show.movieId) === movieId
            )
          );
          setMovieTitle(movieResponse.data.movie?.title || "Movie");
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Could not load showtimes. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadShows();
    return () => {
      active = false;
    };
  }, [movieId]);

  return (
    <main className="container py-5 page-enter">
      <Link to={`/movies/${movieId}`} className="section-link">
        ← Movie details
      </Link>
      <header className="show-page-heading mt-3 mb-4">
        <p className="hero-eyebrow mb-2">PICK YOUR CINEMA EXPERIENCE</p>
        <h1 className="fw-bold mb-2">{movieTitle || "Choose a showtime"}</h1>
        <p className="text-secondary mb-0">
          Select a theater and showtime to view available seats.
        </p>
      </header>

      {loading && <p className="text-secondary">Finding showtimes...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && shows.length === 0 && (
        <section className="empty-state">
          <h2>No showtimes available</h2>
          <p className="text-secondary">
            There are no scheduled shows for this title yet. Check back soon.
          </p>
          <Link to="/movies" className="btn btn-glass">Browse other movies</Link>
        </section>
      )}

      <div className="show-list">
        {shows.map((show) => {
          const date = new Date(show.showDate);
          const theater = show.theaterId;
          return (
            <article className="show-card" key={show._id}>
              <div className="show-card-details">
                <h2>{theater?.name || "Cinema"}</h2>
                <p className="text-secondary mb-2">
                  {theater?.location || "Location unavailable"} · Screen{" "}
                  {show.screenNumber}
                </p>
                <p className="show-date mb-0">
                  {Number.isNaN(date.getTime())
                    ? "Date unavailable"
                    : date.toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                </p>
              </div>
              <div className="show-card-booking">
                <span className="show-price">
                  ₹{Number(show.price || 0).toFixed(2)}{" "}
                  <small>/ seat</small>
                </span>
                <Link
                  className="btn btn-premium"
                  to={`/shows/${show._id}/seats`}
                  aria-label={`Choose seats for ${show.showTime} at ${theater?.name || "this theater"}`}
                >
                  {show.showTime} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

export default ShowSelection;


import { useEffect, useState } from "react";
import api from "../services/api";
import MovieCard from "../components/MovieCard";

function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get("/watchlist")
      .then((response) => {
        if (!active) return;
        const items = response.data.watchlist || [];
        setMovies(
          items
            .map((item) => item.movieId)
            .filter((movie) => movie && movie._id)
        );
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message || "Could not load watchlist."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const removeMovie = async (movieId) => {
    setError("");
    try {
      await api.delete(`/watchlist/${movieId}`);
      setMovies((current) => current.filter((movie) => movie._id !== movieId));
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove movie.");
    }
  };

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">My Watchlist</h1>

      {loading && <p>Loading watchlist...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && movies.length === 0 && (
        <p>Your watchlist is empty.</p>
      )}

      <div className="row g-4">
        {movies.map((movie) => (
          <div className="col-6 col-md-4 col-lg-3" key={movie._id}>
            <MovieCard movie={movie} />
            <button
              className="btn btn-outline-danger w-100 mt-2"
              onClick={() => removeMovie(movie._id)}
            >
              Remove from Watchlist
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Watchlist;

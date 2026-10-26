
import { useEffect, useState } from "react";
import api from "../services/api";

const initialForm = {
  title: "",
  language: "English",
  duration: "",
  releaseDate: "",
  description: "",
  poster: "",
  rating: "0",
  genre: "",
};

function AdminDashboard() {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    try {
      const response = await api.get("/movies");
      setMovies(response.data.movies || []);
    } catch {
      setError("Could not load movies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/movies", {
        ...form,
        duration: Number(form.duration),
        rating: Number(form.rating),
        genre: form.genre
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setForm(initialForm);
      setMessage("Movie added successfully.");
      await fetchMovies();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add movie.");
    }
  };

  const deleteMovie = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(`/movies/${movieId}`);
      setMovies((current) =>
        current.filter((movie) => movie._id !== movieId)
      );
      setMessage("Movie deleted.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete movie.");
    }
  };

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-4">Admin Dashboard</h1>

      <form className="admin-form mb-5" onSubmit={handleSubmit}>
        <h4 className="mb-4">Add a Movie</h4>

        {error && <p className="text-danger">{error}</p>}
        {message && <p className="text-success">{message}</p>}

        <div className="row g-3">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Movie title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Genres (e.g. Sci-Fi, Action)"
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              required
            />
          </div>

          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Language"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              required
            />
          </div>

          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              placeholder="Duration (minutes)"
              min="1"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              required
            />
          </div>

          <div className="col-md-4">
            <input
              type="number"
              className="form-control"
              placeholder="Rating (0–10)"
              min="0"
              max="10"
              step="0.1"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Release date</label>
            <input
              type="date"
              className="form-control"
              value={form.releaseDate}
              onChange={(e) =>
                setForm({ ...form, releaseDate: e.target.value })
              }
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Poster URL</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://example.com/poster.jpg"
              value={form.poster}
              onChange={(e) => setForm({ ...form, poster: e.target.value })}
            />
          </div>

          <div className="col-12">
            <textarea
              className="form-control"
              placeholder="Movie description"
              rows="4"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>
        </div>

        <button className="btn btn-danger mt-3">Add Movie</button>
      </form>

      <h4 className="mb-3">Manage Movies</h4>

      {loading && <p>Loading movies...</p>}

      {!loading &&
        movies.map((movie) => (
          <div
            key={movie._id}
            className="admin-movie-row d-flex justify-content-between align-items-center gap-3 mb-2"
          >
            <span>{movie.title}</span>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => deleteMovie(movie._id)}
            >
              Delete
            </button>
          </div>
        ))}
    </main>
  );
}

export default AdminDashboard;

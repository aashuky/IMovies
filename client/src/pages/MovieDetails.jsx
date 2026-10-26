import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await api.get(`/movies/${id}`);
        setMovie(response.data.movie);
      } catch {
        setError("Movie nahi mili.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) return <p className="container py-5">Loading movie...</p>;

  if (error || !movie) {
    return (
      <div className="container py-5">
        <p className="text-danger">{error || "Movie nahi mili."}</p>
        <Link to="/movies" className="btn btn-outline-light">
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <main className="container py-5">
      <div className="row g-5 align-items-start">
        <div className="col-md-4">
          <img
            src={movie.poster || "https://placehold.co/400x600?text=IMovies"}
            alt={movie.title}
            className="img-fluid rounded-4 details-poster"
          />
        </div>

        <div className="col-md-8">
          <h1 className="display-5 fw-bold">{movie.title}</h1>

          <p className="text-secondary">
            {movie.language} · {movie.duration} minutes
          </p>

          <p>
            <strong>Genre:</strong>{" "}
            {Array.isArray(movie.genre)
              ? movie.genre.join(", ")
              : movie.genre}
          </p>

          <p>
            <strong>Rating:</strong> {movie.rating ?? "Not rated"}
          </p>

          <h5 className="mt-4">About the movie</h5>
          <p>{movie.description || "No description available."}</p>

          <Link
            to={`/movies/${movie._id}/shows`}
            className="btn btn-danger btn-lg mt-3"
          >
            Book Tickets
          </Link>
        </div>
      </div>
    </main>
  );
}

export default MovieDetails;
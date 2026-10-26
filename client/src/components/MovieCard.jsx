
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  return (
    <div className="card movie-card h-100 bg-dark text-white border-secondary">
      <img
        src={movie.poster || "https://placehold.co/300x450?text=IMovies"}
        className="card-img-top movie-poster"
        alt={movie.title}
      />

      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{movie.title}</h5>

        <p className="text-secondary mb-2">
          {movie.language || "Language unavailable"}
        </p>

        <p className="mb-3">
          Rating: {movie.rating ?? "Not rated"}
        </p>

        <Link
          to={`/movies/${movie._id}`}
          className="btn btn-danger mt-auto"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default MovieCard;

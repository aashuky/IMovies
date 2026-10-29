
import { Link } from "react-router-dom";
import { fallbackPoster, handlePosterError } from "../services/poster";

function MovieCard({ movie }) {
  const genres = Array.isArray(movie.genre)
    ? movie.genre.join(" · ")
    : movie.genre || movie.language || "Movie";

  return (
    <article className="movie-card">
      <Link
        to={`/movies/${movie._id}`}
        aria-label={`View ${movie.title} details`}
      >
        <div className="movie-poster-wrap">
          <img
            src={movie.poster || fallbackPoster(movie.title)}
            className="movie-poster"
            alt={movie.title}
            loading="lazy"
            onError={(event) => handlePosterError(event, movie.title)}
          />

          <div className="poster-overlay">
            <span className="btn-premium w-100 text-center">
              View Details
            </span>
          </div>
        </div>
      </Link>

      <div className="movie-card-body">
        <h3 className="movie-card-title" title={movie.title}>
          {movie.title}
        </h3>

        <div className="d-flex justify-content-between align-items-center gap-2">
          <span className="movie-card-meta text-truncate">{genres}</span>

          {Number(movie.rating) > 0 && (
            <span className="movie-rating">
              ★ {Number(movie.rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default MovieCard;

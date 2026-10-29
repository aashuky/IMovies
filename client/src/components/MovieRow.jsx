import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

function MovieRow({ title, movies = [] }) {
  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="movie-row mb-5">
      {title && (
        <div className="section-heading">
          <h2>{title}</h2>
          <Link to="/movies" className="section-link">
            View All →
          </Link>
        </div>
      )}
      <div className="row g-3 g-lg-4">
        {movies.map((movie) => (
          <div className="col-6 col-md-4 col-lg-3" key={movie._id}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default MovieRow;

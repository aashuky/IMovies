
import { Link } from "react-router-dom";
import MovieCard from "./MovieCard";

function MovieRow({ title, movies = [] }) {
  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="movie-row mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">{title}</h2>

        <Link
          to="/movies"
          className="text-danger text-decoration-none"
        >
          View All
        </Link>
      </div>

      <div className="row g-4">
        {movies.map((movie) => (
          <div
            className="col-6 col-md-4 col-lg-3"
            key={movie._id}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default MovieRow;

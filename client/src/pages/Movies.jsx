import { useEffect, useState } from "react";
import api from "../services/api";
import MovieCard from "../components/MovieCard";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await api.get("/movies");
        setMovies(response.data.movies || []);
      } catch {
        setError("Movies load nahi hui. Backend check karo.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="container py-5">
      <h1 className="fw-bold mb-2">Explore Movies</h1>
      <p className="text-secondary mb-4">
        Find your next favourite movie.
      </p>

      <input
        type="search"
        className="form-control mb-4 movie-search"
        placeholder="Search movies by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>Loading movies...</p>}
      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && filteredMovies.length === 0 && (
        <p>No matching movies found.</p>
      )}

      <div className="row g-4">
        {filteredMovies.map((movie) => (
          <div className="col-6 col-md-4 col-lg-3" key={movie._id}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </main>
  );
}

export default Movies;
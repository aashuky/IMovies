
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import MovieRow from "../components/MovieRow";

function Home() {
  const [movies, setMovies] = useState([]);
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

  return (
    <main className="container py-4">
      <section className="hero-section rounded-4 p-4 p-md-5 mb-5">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <p className="text-danger fw-bold">WELCOME TO IMOVIES</p>

            <h1 className="display-4 fw-bold">
              Your next movie night starts here.
            </h1>

            <p className="text-secondary">
              Explore movies, discover stories and book your seats.
            </p>

            <Link to="/movies" className="btn btn-danger btn-lg">
              Explore Movies
            </Link>
          </div>
        </div>
      </section>

      {loading && <p>Loading movies...</p>}

      {error && <p className="text-danger">{error}</p>}

      {!loading && !error && movies.length === 0 && (
        <p>No movies available yet.</p>
      )}

      {!loading && !error && movies.length > 0 && (
        <MovieRow
          title="Popular Movies"
          movies={movies.slice(0, 8)}
        />
      )}
    </main>
  );
}

export default Home;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import MovieRow from "../components/MovieRow";
import { fallbackPoster, handlePosterError } from "../services/poster";

function getYouTubeEmbedUrl(trailerUrl) {
  if (!trailerUrl) return "";
  try {
    const url = new URL(trailerUrl);
    let videoId = "";
    if (url.hostname === "youtu.be") {
      videoId = url.pathname.slice(1);
    } else if (url.hostname === "youtube.com" || url.hostname === "www.youtube.com") {
      videoId = url.searchParams.get("v") || url.pathname.split("/").pop();
    } else if (url.hostname === "www.youtube-nocookie.com") {
      videoId = url.pathname.split("/").pop();
    }
    if (!/^[\w-]{11}$/.test(videoId || "")) return "";
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0`;
  } catch {
    return "";
  }
}

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  useEffect(() => {
    let active = true;
    api.get("/movies")
      .then((response) => {
        if (active) setMovies(response.data.movies || []);
      })
      .catch(() => {
        if (active) setError("Movies could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const topMovies = useMemo(
    () =>
      movies
        .filter((movie) => !movie.title?.startsWith("Sample Feature "))
        .sort((first, second) => {
          const ratingDifference = Number(second.rating || 0) - Number(first.rating || 0);
          if (ratingDifference !== 0) return ratingDifference;
          const firstIsSample = first.title?.startsWith("Sample Feature ");
          const secondIsSample = second.title?.startsWith("Sample Feature ");
          return Number(firstIsSample) - Number(secondIsSample);
        })
        .slice(0, 5),
    [movies]
  );
  const featuredMovie = topMovies[activeIndex] || topMovies[0];
  const trailerEmbedUrl = getYouTubeEmbedUrl(featuredMovie?.trailerUrl);

  useEffect(() => {
    if (!autoAdvance || topMovies.length < 2) return undefined;
    const timerId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % topMovies.length);
    }, 10000);
    return () => window.clearInterval(timerId);
  }, [autoAdvance, topMovies.length]);

  const goToMovie = (index) => {
    setActiveIndex((index + topMovies.length) % topMovies.length);
  };

  return (
    <main className="page-enter">
      <div className="container py-4 py-lg-5">
        <section
          className="hero-premium hero-carousel mb-5"
          aria-label="Featured movies"
        >
          {featuredMovie && (
            <div className="hero-media" aria-hidden="true">
              <img
                key={`${featuredMovie._id}-poster`}
                className="hero-poster"
                src={featuredMovie.poster || fallbackPoster(featuredMovie.title)}
                alt=""
                onError={(event) => handlePosterError(event, featuredMovie.title)}
              />
              {trailerEmbedUrl && (
                <iframe
                  key={featuredMovie._id}
                  className="hero-trailer"
                  src={trailerEmbedUrl}
                  title={`${featuredMovie.title} trailer`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}
            </div>
          )}
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <span aria-hidden="true">●</span>
              TOP 5 · FEATURED THIS WEEK
            </span>
            <h1 className="hero-title">
              {featuredMovie ? featuredMovie.title : "Great stories."}
            </h1>
            <p className="hero-description">
              {featuredMovie?.description ||
                "Discover your next favourite film, find a cinema and make your next movie night special."}
            </p>
            {featuredMovie && (
              <p className="text-secondary mb-4">
                {featuredMovie.language || "Movie"}
                {Number(featuredMovie.rating) > 0
                  ? ` · ★ ${Number(featuredMovie.rating).toFixed(1)}`
                  : ""}
                {!trailerEmbedUrl && " · Trailer unavailable — showing poster"}
              </p>
            )}
            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link to="/movies" className="btn btn-premium">
                Explore movies <span aria-hidden="true">→</span>
              </Link>
              {featuredMovie && (
                <Link to={`/movies/${featuredMovie._id}`} className="btn btn-glass">
                  View movie
                </Link>
              )}
            </div>
          </div>
          {topMovies.length > 0 && (
            <div className="hero-controls">
              <div className="hero-dots" aria-label="Select featured movie">
                {topMovies.map((movie, index) => (
                  <button
                    key={movie._id}
                    type="button"
                    className={`hero-dot ${index === activeIndex ? "active" : ""}`}
                    aria-label={`Show ${movie.title}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    onClick={() => goToMovie(index)}
                  />
                ))}
              </div>
              <span className="hero-counter">
                {String(activeIndex + 1).padStart(2, "0")} / {String(topMovies.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                className="hero-play-toggle"
                onClick={() => setAutoAdvance((playing) => !playing)}
                aria-label={autoAdvance ? "Pause featured movie rotation" : "Resume featured movie rotation"}
              >
                {autoAdvance ? "Ⅱ" : "▶"}
              </button>
            </div>
          )}
          {loading && <div className="hero-loading">Preparing your picks...</div>}
          {error && <div className="hero-loading" role="alert">{error}</div>}
        </section>

        <section className="mb-5">
          <div className="section-heading">
            <div>
              <p className="hero-eyebrow mb-2">HIGHEST RATED</p>
              <h2>Top 5 on IMovies</h2>
            </div>
            <Link to="/movies" className="section-link">Browse all →</Link>
          </div>
          {loading && (
            <div className="row g-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div className="col-6 col-md-4 col-lg" key={item}>
                  <div className="skeleton movie-poster-wrap" />
                  <div className="skeleton mt-3" style={{ minHeight: 16 }} />
                </div>
              ))}
            </div>
          )}
          {error && <p className="text-danger">{error}</p>}
          {!loading && !error && topMovies.length === 0 && (
            <div className="empty-state">
              <h3>No movies available yet</h3>
              <p className="text-secondary mb-0">
                Movies will appear here when they are added to the catalog.
              </p>
            </div>
          )}
          {!loading && !error && topMovies.length > 0 && (
            <MovieRow title="" movies={topMovies} />
          )}
        </section>

        <section className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="home-feature-card p-4 h-100 rounded-4">
              <p className="hero-eyebrow">01 / DISCOVER</p>
              <h3>Find your next favourite</h3>
              <p className="text-secondary mb-0">
                Browse a growing movie catalog by title, genre and language.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="home-feature-card p-4 h-100 rounded-4">
              <p className="hero-eyebrow">02 / CHOOSE</p>
              <h3>Pick your seats</h3>
              <p className="text-secondary mb-0">
                Select your seats and see the total before checkout.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="home-feature-card p-4 h-100 rounded-4">
              <p className="hero-eyebrow">03 / ENJOY</p>
              <h3>Keep every booking close</h3>
              <p className="text-secondary mb-0">
                Find your reservations, account and preferences in one place.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;

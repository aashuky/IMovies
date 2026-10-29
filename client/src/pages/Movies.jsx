import { useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import MovieCard from "../components/MovieCard";

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { value: "newest", label: "🆕 Newest" },
  { value: "rating", label: "⭐ Top Rated" },
  { value: "title", label: "🔤 Title A–Z" },
  { value: "oldest", label: "📅 Oldest" },
];

function Movies() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    let active = true;
    api
      .get("/movies")
      .then((response) => {
        if (active) {
          // Filter out any "Sample Feature" dummy movies
          const real = (response.data.movies || []).filter(
            (m) => m.title && !m.title.startsWith("Sample Feature ")
          );
          setMovies(real);
        }
      })
      .catch(() => {
        if (active) setError("Movies could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const genres = useMemo(
    () =>
      [
        ...new Set(
          movies.flatMap((movie) =>
            Array.isArray(movie.genre)
              ? movie.genre
              : movie.genre
              ? [movie.genre]
              : []
          )
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [movies]
  );

  const languages = useMemo(
    () =>
      [...new Set(movies.map((m) => m.language).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [movies]
  );

  const sortedMovies = useMemo(() => {
    const filtered = movies.filter((movie) => {
      const movieGenres = Array.isArray(movie.genre)
        ? movie.genre.join(" ")
        : movie.genre || "";

      const matchesGenre =
        !genreFilter ||
        (Array.isArray(movie.genre)
          ? movie.genre.includes(genreFilter)
          : movie.genre === genreFilter);

      const matchesLang = !langFilter || movie.language === langFilter;

      const matchesSearch = [movie.title, movieGenres, movie.language]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(normalizedSearch));

      return matchesGenre && matchesLang && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "rating")
        return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "oldest")
        return (
          new Date(a.releaseDate || a.createdAt || 0) -
          new Date(b.releaseDate || b.createdAt || 0)
        );
      // newest
      return (
        new Date(b.releaseDate || b.createdAt || 0) -
        new Date(a.releaseDate || a.createdAt || 0)
      );
    });
  }, [genreFilter, langFilter, movies, normalizedSearch, sortBy]);

  const pageCount = Math.ceil(sortedMovies.length / PAGE_SIZE);
  const visibleMovies = sortedMovies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const clearFilters = () => {
    setSearch("");
    setGenreFilter("");
    setLangFilter("");
    setSortBy("rating");
    setPage(1);
    searchRef.current?.focus();
  };

  const hasFilters =
    search || genreFilter || langFilter || sortBy !== "rating";

  return (
    <main className="container py-5 page-enter">
      <header className="mb-5">
        <p className="hero-eyebrow mb-2">THE IMOVIES CATALOG</p>
        <h1 className="fw-bold mb-2">
          Explore{" "}
          <span className="text-gradient">{movies.length}</span> Movies
        </h1>
        <p className="text-secondary mb-0">
          Search by title, genre or language — all the cinema you love, in one place.
        </p>
      </header>

      {/* Search */}
      <div className="catalog-search-wrap mb-4">
        <span className="catalog-search-icon">🔍</span>
        <input
          ref={searchRef}
          type="search"
          className="form-control movie-search"
          aria-label="Search movies by title, genre, or language"
          placeholder="Search movies, genres, languages…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        {search && (
          <button
            className="catalog-search-clear"
            onClick={() => { setSearch(""); setPage(1); }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="movie-filters mb-4">
        <label>
          <span>Genre</span>
          <select
            className="form-select"
            value={genreFilter}
            onChange={(e) => { setGenreFilter(e.target.value); setPage(1); }}
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Language</span>
          <select
            className="form-select"
            value={langFilter}
            onChange={(e) => { setLangFilter(e.target.value); setPage(1); }}
          >
            <option value="">All languages</option>
            {languages.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Sort by</span>
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>

        {hasFilters && (
          <button className="btn btn-glass btn-sm mt-auto" onClick={clearFilters}>
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Result count */}
      {!loading && !error && (
        <p className="text-secondary small mb-3 catalog-count">
          <strong className="text-gradient">{sortedMovies.length}</strong>{" "}
          {sortedMovies.length === 1 ? "movie" : "movies"}
          {normalizedSearch && ` matching "${search.trim()}"`}
          {pageCount > 1 && ` · Page ${page} of ${pageCount}`}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="row g-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="col-6 col-md-4 col-lg-3" key={i}>
              <div className="skeleton movie-poster-wrap" />
              <div className="skeleton mt-2" style={{ minHeight: 14, borderRadius: 6 }} />
              <div className="skeleton mt-1" style={{ minHeight: 10, borderRadius: 6, width: "60%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && sortedMovies.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎬</div>
          <h3>No movies found</h3>
          <p className="text-secondary mb-3">
            Try a different title, genre or language.
          </p>
          <button className="btn btn-glass" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}

      {/* Movie grid */}
      <div className="row g-4">
        {visibleMovies.map((movie, idx) => (
          <div
            className="col-6 col-md-4 col-lg-3"
            key={movie._id}
            style={{ animationDelay: `${(idx % PAGE_SIZE) * 35}ms` }}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <nav className="catalog-pagination" aria-label="Movie pages">
          <button
            className="btn btn-glass"
            disabled={page === 1}
            onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            ← Previous
          </button>

          <div className="catalog-page-nums">
            {Array.from({ length: pageCount }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pageCount)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && arr[i - 1] !== p - 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "…" ? (
                  <span key={`e${i}`} className="page-ellipsis">…</span>
                ) : (
                  <button
                    key={item}
                    className={`page-num-btn ${item === page ? "active" : ""}`}
                    onClick={() => { setPage(item); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    {item}
                  </button>
                )
              )}
          </div>

          <button
            className="btn btn-glass"
            disabled={page === pageCount}
            onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            Next →
          </button>
        </nav>
      )}
    </main>
  );
}

export default Movies;

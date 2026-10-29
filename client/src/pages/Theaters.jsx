import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Theaters() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/theaters")
      .then((res) => setTheaters(res.data.theaters || []))
      .catch(() => setError("Could not load theaters."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = theaters.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="container py-5 page-enter">
      <header className="mb-4">
        <p className="hero-eyebrow mb-2">🎭 CINEMA LOCATIONS</p>
        <h1 className="fw-bold mb-2">Our Theaters</h1>
        <p className="text-secondary mb-0">
          Find your nearest cinema, explore screens and order food & beverages.
        </p>
      </header>

      <input
        type="search"
        className="form-control movie-search mb-4"
        placeholder="Search by name or city…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search theaters"
      />

      {loading && (
        <div className="theater-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div className="skeleton" key={n} style={{ minHeight: 200, borderRadius: 18 }} />
          ))}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <p className="mb-0">No theaters found{search && ` for "${search}"`}.</p>
        </div>
      )}

      <div className="theater-grid">
        {filtered.map((theater) => (
          <div className="theater-card" key={theater._id}>
            <div className="theater-card-header">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #ff3158, #6558f5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    flexShrink: 0,
                  }}
                >
                  🎬
                </div>
                <div>
                  <div className="theater-name">{theater.name}</div>
                  <div className="theater-location">
                    <span>📍</span>
                    {theater.location}
                  </div>
                </div>
              </div>
              <div className="theater-meta-row">
                <span className="theater-screen-badge">
                  🖥️ {theater.screens} Screen{theater.screens !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="theater-card-body">
              <p className="text-secondary small mb-3" style={{ lineHeight: 1.5 }}>
                Enjoy the latest blockbusters in premium comfort with Dolby sound and luxury seating.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Link
                  to={`/theaters/${theater._id}/products`}
                  className="btn btn-premium btn-sm"
                  id={`theater-products-${theater._id}`}
                >
                  🍿 Food & Drinks
                </Link>
                <Link
                  to="/movies"
                  className="btn btn-glass btn-sm"
                >
                  🎟️ Book Tickets
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Theaters;

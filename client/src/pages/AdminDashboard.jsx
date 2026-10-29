import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// ─── Empty States ──────────────────────────────────────────────────────────────
const emptyMovie = { title: "", language: "English", duration: "", releaseDate: "", description: "", poster: "", trailerUrl: "", rating: "0", genre: "" };
const emptyTheater = { name: "", location: "", screens: "1" };
const emptyShow = { movieId: "", theaterId: "", screenNumber: "1", showDate: "", showTime: "", price: "" };
const emptyProduct = { theaterId: "", name: "", description: "", category: "snack", price: "", image: "", stock: "50" };

// ─── Stats Card ─────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-value" style={color ? { background: color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" } : {}}>{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [movieForm, setMovieForm] = useState(emptyMovie);
  const [theaterForm, setTheaterForm] = useState(emptyTheater);
  const [showForm, setShowForm] = useState(emptyShow);
  const [productForm, setProductForm] = useState(emptyProduct);

  const [editingMovieId, setEditingMovieId] = useState("");
  const [editingTheaterId, setEditingTheaterId] = useState("");
  const [editingProductId, setEditingProductId] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setNotice(""); }
    else { setNotice(msg); setError(""); }
    setTimeout(() => { setError(""); setNotice(""); }, 4000);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const reloadAll = useCallback(async () => {
    try {
      const [mR, tR, sR, bR, uR, pR, oR] = await Promise.all([
        api.get("/movies"),
        api.get("/theaters"),
        api.get("/shows"),
        api.get("/bookings/all"),
        api.get("/users"),
        api.get("/theater-products"),
        api.get("/orders"),
      ]);
      setMovies(mR.data.movies || []);
      setTheaters(tR.data.theaters || []);
      setShows(sR.data.shows || []);
      setBookings(bR.data.bookings || []);
      setUsers(uR.data.users || []);
      setProducts(pR.data.products || []);
      setOrders(oR.data.orders || []);
    } catch (e) {
      flash("Could not load some data.", true);
    }
  }, []);

  useEffect(() => {
    reloadAll().finally(() => setLoading(false));
  }, [reloadAll]);

  // ── Movie CRUD ──────────────────────────────────────────────────────────────
  const submitMovie = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...movieForm, duration: Number(movieForm.duration), rating: Number(movieForm.rating), genre: movieForm.genre.split(",").map((g) => g.trim()).filter(Boolean) };
    try {
      if (editingMovieId) { await api.put(`/movies/${editingMovieId}`, payload); flash("Movie updated."); }
      else { await api.post("/movies", payload); flash("Movie added."); }
      setMovieForm(emptyMovie); setEditingMovieId("");
      await reloadAll();
    } catch (err) { flash(err.response?.data?.message || "Could not save movie.", true); }
    finally { setSaving(false); }
  };

  const editMovie = (movie) => {
    setEditingMovieId(movie._id);
    setMovieForm({ title: movie.title || "", language: movie.language || "", duration: String(movie.duration || ""), releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().slice(0, 10) : "", description: movie.description || "", poster: movie.poster || "", trailerUrl: movie.trailerUrl || "", rating: String(movie.rating ?? "0"), genre: Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre || "" });
    setActiveTab("movies");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteMovie = async (id) => {
    if (!window.confirm("Delete this movie?")) return;
    try { await api.delete(`/movies/${id}`); setMovies((p) => p.filter((m) => m._id !== id)); flash("Movie deleted."); }
    catch (err) { flash(err.response?.data?.message || "Could not delete.", true); }
  };

  // ── Theater CRUD ────────────────────────────────────────────────────────────
  const submitTheater = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...theaterForm, screens: Number(theaterForm.screens) };
    try {
      if (editingTheaterId) { await api.put(`/theaters/${editingTheaterId}`, payload); flash("Theater updated."); }
      else { await api.post("/theaters", payload); flash("Theater added."); }
      setTheaterForm(emptyTheater); setEditingTheaterId("");
      await reloadAll();
    } catch (err) { flash(err.response?.data?.message || "Could not save theater.", true); }
    finally { setSaving(false); }
  };

  const editTheater = (t) => {
    setEditingTheaterId(t._id);
    setTheaterForm({ name: t.name, location: t.location, screens: String(t.screens) });
    setActiveTab("theaters");
  };

  const deleteTheater = async (id) => {
    if (!window.confirm("Delete this theater?")) return;
    try { await api.delete(`/theaters/${id}`); setTheaters((p) => p.filter((t) => t._id !== id)); flash("Theater deleted."); }
    catch (err) { flash(err.response?.data?.message || "Could not delete.", true); }
  };

  // ── Show CRUD ───────────────────────────────────────────────────────────────
  const submitShow = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/shows", { ...showForm, screenNumber: Number(showForm.screenNumber), price: Number(showForm.price) });
      setShowForm(emptyShow); flash("Show scheduled.");
      await reloadAll();
    } catch (err) { flash(err.response?.data?.message || "Could not add show.", true); }
    finally { setSaving(false); }
  };

  const deleteShow = async (id) => {
    if (!window.confirm("Delete this show?")) return;
    try { await api.delete(`/shows/${id}`); setShows((p) => p.filter((s) => s._id !== id)); flash("Show deleted."); }
    catch (err) { flash(err.response?.data?.message || "Could not delete.", true); }
  };

  // ── Product CRUD ────────────────────────────────────────────────────────────
  const submitProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) };
    try {
      if (editingProductId) { await api.put(`/theater-products/${editingProductId}`, payload); flash("Product updated."); }
      else { await api.post("/theater-products", payload); flash("Product added."); }
      setProductForm(emptyProduct); setEditingProductId("");
      await reloadAll();
    } catch (err) { flash(err.response?.data?.message || "Could not save product.", true); }
    finally { setSaving(false); }
  };

  const editProduct = (p) => {
    setEditingProductId(p._id);
    setProductForm({ theaterId: p.theaterId?._id || p.theaterId || "", name: p.name, description: p.description || "", category: p.category, price: String(p.price), image: p.image || "", stock: String(p.stock) });
    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await api.delete(`/theater-products/${id}`); setProducts((p) => p.filter((pr) => pr._id !== id)); flash("Product deleted."); }
    catch (err) { flash(err.response?.data?.message || "Could not delete.", true); }
  };

  // ── User Management ─────────────────────────────────────────────────────────
  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    try {
      const res = await api.patch(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: res.data.user.role } : u));
      flash(`User role updated to ${newRole}.`);
    } catch (err) { flash(err.response?.data?.message || "Could not update role.", true); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try { await api.delete(`/users/${userId}`); setUsers((p) => p.filter((u) => u._id !== userId)); flash("User deleted."); }
    catch (err) { flash(err.response?.data?.message || "Could not delete user.", true); }
  };

  // ── Order Management ────────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: res.data.order.status } : o));
      flash(`Order status → ${status}.`);
    } catch (err) { flash(err.response?.data?.message || "Could not update order.", true); }
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: "📊", count: null },
    { key: "movies", label: "Movies", icon: "🎬", count: movies.length },
    { key: "theaters", label: "Theaters", icon: "🎭", count: theaters.length },
    { key: "shows", label: "Shows", icon: "🎟️", count: shows.length },
    { key: "products", label: "Products", icon: "🍿", count: products.length },
    { key: "bookings", label: "Bookings", icon: "📋", count: bookings.length },
    { key: "orders", label: "Orders", icon: "🛒", count: orders.length },
    { key: "users", label: "Users", icon: "👥", count: users.length },
  ];

  const confirmedBookings = bookings.filter((b) => b.paymentStatus === "paid").length;
  const totalRevenue = bookings.filter((b) => b.paymentStatus === "paid").reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <main className="container py-5 page-enter">
      <header className="mb-4 d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <p className="hero-eyebrow mb-2">⚙️ CONTROL CENTER</p>
          <h1 className="fw-bold mb-1">Admin Dashboard</h1>
          <p className="text-secondary mb-0">Manage movies, theaters, shows, products, bookings, orders and users.</p>
        </div>
        <button type="button" className="btn btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </header>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {loading && <p className="text-secondary">Loading dashboard…</p>}

      {/* Tabs */}
      <div className="admin-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab-btn ${activeTab === tab.key ? "active" : ""}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.count !== null && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <div>
          <div className="admin-stats-bar">
            <StatCard icon="🎬" value={movies.length} label="Movies in catalog" />
            <StatCard icon="🎭" value={theaters.length} label="Theater locations" />
            <StatCard icon="🎟️" value={shows.length} label="Active shows" />
            <StatCard icon="📋" value={confirmedBookings} label="Confirmed bookings" color="linear-gradient(110deg,#46c37b,#2ecc71)" />
            <StatCard icon="🛒" value={orders.length} label="Food orders" />
            <StatCard icon="👥" value={users.length} label="Registered users" />
            <StatCard icon="💰" value={`₹${(totalRevenue / 1000).toFixed(1)}K`} label="Ticket revenue" color="linear-gradient(110deg,#ffd783,#f5a623)" />
            <StatCard icon="🍿" value={products.length} label="Products listed" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            <div className="admin-section">
              <div className="section-heading"><h2>Recent Bookings</h2></div>
              <div className="admin-list">
                {bookings.slice(0, 10).map((b) => (
                  <div className="admin-movie-row" key={b._id}>
                    <div style={{ fontSize: "0.88rem" }}>
                      <strong>{b.userId?.name || "User"}</strong> — {b.showId?.movieId?.title || "Movie"}
                      <br />
                      <span className="text-secondary small">
                        {b.seats?.join(", ")} · ₹{b.totalAmount} ·{" "}
                        <span className={b.paymentStatus === "paid" ? "text-success" : "text-danger"}>
                          {b.paymentStatus}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
                {bookings.length === 0 && <p className="text-secondary small">No bookings yet.</p>}
              </div>
            </div>

            <div className="admin-section">
              <div className="section-heading"><h2>Recent Orders</h2></div>
              <div className="admin-list">
                {orders.slice(0, 10).map((o) => (
                  <div className="admin-movie-row" key={o._id}>
                    <div style={{ fontSize: "0.88rem" }}>
                      <strong>{o.userId?.name || "User"}</strong> — {o.theaterId?.name || "Theater"}
                      <br />
                      <span className="text-secondary small">
                        {o.items.length} items · ₹{o.totalAmount} ·{" "}
                        <span className={o.status === "delivered" ? "text-success" : o.status === "cancelled" ? "text-danger" : ""}>
                          {o.status}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-secondary small">No orders yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MOVIES ── */}
      {activeTab === "movies" && (
        <div className="admin-management-grid">
          <section className="admin-section admin-section-full">
            <div className="section-heading">
              <h2>Movies <span className="text-secondary">({movies.length})</span></h2>
            </div>
            <form className="admin-form admin-form-wide mb-4" onSubmit={submitMovie}>
              <h3 className="h5 mb-3">{editingMovieId ? "Edit Movie" : "Add a Movie"}</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <input className="form-control" placeholder="Movie title" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <input className="form-control" placeholder="Genres (comma separated)" value={movieForm.genre} onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <input className="form-control" placeholder="Language" value={movieForm.language} onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <input type="number" min="1" className="form-control" placeholder="Duration (mins)" value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <input type="number" min="0" max="10" step="0.1" className="form-control" placeholder="Rating (0–10)" value={movieForm.rating} onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small">Release Date</label>
                  <input type="date" className="form-control" value={movieForm.releaseDate} onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small">Poster URL</label>
                  <input type="url" className="form-control" placeholder="https://…" value={movieForm.poster} onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small">YouTube Trailer URL</label>
                  <input type="url" className="form-control" placeholder="https://youtube.com/watch?v=…" value={movieForm.trailerUrl} onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })} />
                </div>
                <div className="col-12">
                  <textarea className="form-control" rows="3" placeholder="Movie description" value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} required />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-premium" disabled={saving}>{saving ? "Saving…" : editingMovieId ? "Save Changes" : "Add Movie"}</button>
                {editingMovieId && (
                  <button type="button" className="btn btn-glass" onClick={() => { setEditingMovieId(""); setMovieForm(emptyMovie); }}>Cancel</button>
                )}
              </div>
            </form>

            <div className="admin-list">
              {movies.map((movie) => (
                <div className="admin-movie-row" key={movie._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    {movie.poster && <img src={movie.poster} alt="" style={{ width: 36, height: 48, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{movie.title}</div>
                      <div className="text-secondary small">{movie.language} · {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre} · ★ {movie.rating}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-2" style={{ flexShrink: 0 }}>
                    <button className="btn btn-glass btn-sm" onClick={() => editMovie(movie)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteMovie(movie._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {movies.length === 0 && <p className="text-secondary small">No movies yet.</p>}
            </div>
          </section>
        </div>
      )}

      {/* ── THEATERS ── */}
      {activeTab === "theaters" && (
        <div className="admin-management-grid">
          <section className="admin-section">
            <div className="section-heading"><h2>{editingTheaterId ? "Edit Theater" : "Add Theater"}</h2></div>
            <form className="admin-form admin-form-wide" onSubmit={submitTheater}>
              <div className="row g-3">
                <div className="col-md-6">
                  <input className="form-control" placeholder="Theater name" value={theaterForm.name} onChange={(e) => setTheaterForm({ ...theaterForm, name: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <input className="form-control" placeholder="Location / City" value={theaterForm.location} onChange={(e) => setTheaterForm({ ...theaterForm, location: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <input type="number" min="1" className="form-control" placeholder="Number of screens" value={theaterForm.screens} onChange={(e) => setTheaterForm({ ...theaterForm, screens: e.target.value })} required />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-premium" disabled={saving}>{saving ? "Saving…" : editingTheaterId ? "Save Changes" : "Add Theater"}</button>
                {editingTheaterId && <button type="button" className="btn btn-glass" onClick={() => { setEditingTheaterId(""); setTheaterForm(emptyTheater); }}>Cancel</button>}
              </div>
            </form>
          </section>

          <section className="admin-section">
            <div className="section-heading"><h2>All Theaters <span className="text-secondary">({theaters.length})</span></h2></div>
            <div className="admin-list">
              {theaters.map((t) => (
                <div className="admin-movie-row" key={t._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>🎭 {t.name}</div>
                    <div className="text-secondary small">📍 {t.location} · 🖥️ {t.screens} screens</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-glass btn-sm" onClick={() => editTheater(t)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteTheater(t._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {theaters.length === 0 && <p className="text-secondary small">No theaters yet.</p>}
            </div>
          </section>
        </div>
      )}

      {/* ── SHOWS ── */}
      {activeTab === "shows" && (
        <div className="admin-management-grid">
          <section className="admin-section">
            <h3 className="h5 mb-3">Schedule a Show</h3>
            <form onSubmit={submitShow}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-secondary small">Movie</label>
                  <select className="form-select" value={showForm.movieId} onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })} required>
                    <option value="">Choose a movie</option>
                    {movies.map((m) => <option key={m._id} value={m._id}>{m.title}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-secondary small">Theater</label>
                  <select className="form-select" value={showForm.theaterId} onChange={(e) => setShowForm({ ...showForm, theaterId: e.target.value, screenNumber: "1" })} required>
                    <option value="">Choose a theater</option>
                    {theaters.map((t) => <option key={t._id} value={t._id}>{t.name} · {t.location}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label text-secondary small">Screen</label>
                  <select className="form-select" value={showForm.screenNumber} onChange={(e) => setShowForm({ ...showForm, screenNumber: e.target.value })} required>
                    {Array.from({ length: Math.max(1, Number(theaters.find((t) => t._id === showForm.theaterId)?.screens || 1)) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label text-secondary small">Date</label>
                  <input type="date" className="form-control" value={showForm.showDate} onChange={(e) => setShowForm({ ...showForm, showDate: e.target.value })} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-secondary small">Time</label>
                  <input type="time" className="form-control" value={showForm.showTime} onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-secondary small">Ticket Price (₹)</label>
                  <input type="number" min="0" step="0.01" className="form-control" value={showForm.price} onChange={(e) => setShowForm({ ...showForm, price: e.target.value })} required />
                </div>
              </div>
              <button className="btn btn-premium mt-3" disabled={saving || movies.length === 0 || theaters.length === 0}>
                {saving ? "Scheduling…" : "Schedule Show"}
              </button>
            </form>
          </section>

          <section className="admin-section">
            <div className="section-heading"><h2>All Shows <span className="text-secondary">({shows.length})</span></h2></div>
            <div className="admin-list">
              {shows.map((show) => (
                <div className="admin-movie-row" key={show._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontSize: "0.88rem" }}>
                    <div style={{ fontWeight: 700 }}>{show.movieId?.title || "Movie"}</div>
                    <div className="text-secondary small">
                      {show.theaterId?.name} · Screen {show.screenNumber} · {show.showDate ? new Date(show.showDate).toLocaleDateString("en-IN") : "?"} · {show.showTime} · ₹{show.price}
                    </div>
                  </div>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => deleteShow(show._id)}>Delete</button>
                </div>
              ))}
              {shows.length === 0 && <p className="text-secondary small">No shows scheduled.</p>}
            </div>
          </section>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {activeTab === "products" && (
        <div className="admin-management-grid">
          <section className="admin-section">
            <div className="section-heading"><h2>{editingProductId ? "Edit Product" : "Add Product"}</h2></div>
            <form onSubmit={submitProduct}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-secondary small">Theater</label>
                  <select className="form-select" value={productForm.theaterId} onChange={(e) => setProductForm({ ...productForm, theaterId: e.target.value })} required>
                    <option value="">Select Theater</option>
                    {theaters.map((t) => <option key={t._id} value={t._id}>{t.name} · {t.location}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <input className="form-control" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-secondary small">Category</label>
                  <select className="form-select" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
                    {["food", "beverage", "snack", "combo", "merchandise"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <input type="number" min="0" step="0.01" className="form-control" placeholder="Price (₹)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
                </div>
                <div className="col-md-4">
                  <input type="number" min="0" className="form-control" placeholder="Stock" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
                </div>
                <div className="col-12">
                  <input type="url" className="form-control" placeholder="Image URL (optional)" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} />
                </div>
                <div className="col-12">
                  <input className="form-control" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-premium" disabled={saving}>{saving ? "Saving…" : editingProductId ? "Save Changes" : "Add Product"}</button>
                {editingProductId && <button type="button" className="btn btn-glass" onClick={() => { setEditingProductId(""); setProductForm(emptyProduct); }}>Cancel</button>}
              </div>
            </form>
          </section>

          <section className="admin-section">
            <div className="section-heading"><h2>All Products <span className="text-secondary">({products.length})</span></h2></div>
            <div className="admin-list">
              {products.map((p) => (
                <div className="admin-movie-row" key={p._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontSize: "0.88rem" }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div className="text-secondary small">{p.theaterId?.name} · {p.category} · ₹{p.price} · Stock: {p.stock}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-glass btn-sm" onClick={() => editProduct(p)}>Edit</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => deleteProduct(p._id)}>Delete</button>
                  </div>
                </div>
              ))}
              {products.length === 0 && <p className="text-secondary small">No products yet. Add theaters first.</p>}
            </div>
          </section>
        </div>
      )}

      {/* ── BOOKINGS ── */}
      {activeTab === "bookings" && (
        <div className="admin-section admin-section-full" style={{ marginTop: 0 }}>
          <div className="section-heading mb-3">
            <h2>All Bookings <span className="text-secondary">({bookings.length})</span></h2>
          </div>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Movie</th>
                  <th>Theater</th>
                  <th>Seats</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.userId?.name || "—"}</div>
                      <div className="text-secondary small">{b.userId?.email}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{b.showId?.movieId?.title || "—"}</td>
                    <td className="text-secondary small">{b.showId?.theaterId?.name || "—"}</td>
                    <td className="text-secondary small">{b.seats?.join(", ")}</td>
                    <td className="text-secondary small">{b.createdAt ? new Date(b.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    <td style={{ fontWeight: 700 }}>₹{b.totalAmount}</td>
                    <td>
                      <span className={`order-status-badge ${b.paymentStatus === "paid" ? "status-confirmed" : b.paymentStatus === "refunded" ? "status-cancelled" : "status-pending"}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`order-status-badge ${b.status === "confirmed" ? "status-confirmed" : b.status === "cancelled" ? "status-cancelled" : "status-pending"}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {activeTab === "orders" && (
        <div className="admin-section admin-section-full" style={{ marginTop: 0 }}>
          <div className="section-heading mb-3">
            <h2>All Orders <span className="text-secondary">({orders.length})</span></h2>
          </div>
          <div className="admin-list" style={{ maxHeight: "none" }}>
            {orders.map((o) => (
              <div className="admin-movie-row" key={o._id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: "0.88rem", flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{o.userId?.name} <span className="text-secondary">({o.userId?.email})</span></div>
                  <div className="text-secondary small">{o.theaterId?.name} · {new Date(o.createdAt).toLocaleDateString("en-IN")} · {o.items.length} items · ₹{o.totalAmount}</div>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className={`order-status-badge status-${o.status}`}>{o.status}</span>
                  <select
                    className="form-select"
                    style={{ width: "auto", fontSize: "0.82rem", padding: "4px 8px", minHeight: 32 }}
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                    aria-label="Update order status"
                  >
                    {["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-secondary small">No orders yet.</p>}
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {activeTab === "users" && (
        <div className="admin-section admin-section-full" style={{ marginTop: 0 }}>
          <div className="section-heading mb-3">
            <h2>All Users <span className="text-secondary">({users.length})</span></h2>
          </div>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                      </div>
                    </td>
                    <td className="text-secondary small">{user.email}</td>
                    <td>
                      <span className={`user-role-badge role-${user.role}`}>{user.role}</span>
                    </td>
                    <td className="text-secondary small">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className={`btn btn-sm ${user.role === "admin" ? "btn-outline-danger" : "btn-outline-success"}`}
                          onClick={() => toggleUserRole(user._id, user.role)}
                        >
                          {user.role === "admin" ? "Revoke Admin" : "Make Admin"}
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => deleteUser(user._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;

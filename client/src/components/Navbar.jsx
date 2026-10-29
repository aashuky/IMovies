import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark site-navbar px-3 px-lg-5">
      <Link className="navbar-brand" to="/">
        <span className="brand-mark">I</span>Movies
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="navbarMenu"
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`navbar-collapse ${menuOpen ? "show" : ""}`} id="navbarMenu">
        <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
          <NavLink className="nav-link" to={token ? "/home" : "/"} onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink className="nav-link" to="/movies" onClick={closeMenu}>
            Movies
          </NavLink>

          <NavLink className="nav-link" to="/theaters" onClick={closeMenu}>
            Theaters & Food
          </NavLink>

          {token && (
            <>
              <NavLink className="nav-link" to="/bookings" onClick={closeMenu}>
                My Bookings
              </NavLink>

              <NavLink className="nav-link" to="/orders" onClick={closeMenu}>
                My Orders
              </NavLink>

              <NavLink className="nav-link" to="/watchlist" onClick={closeMenu}>
                Watchlist
              </NavLink>
              <NavLink className="nav-link" to="/profile" onClick={closeMenu}>
                Profile & settings
              </NavLink>
              {user?.role === "admin" && (
                <NavLink className="nav-link" to="/admin" onClick={closeMenu}>
                  Admin Dashboard
                </NavLink>
              )}
              <button className="btn btn-outline-light btn-sm" onClick={logout}>
                Logout
              </button>
            </>
          )}

          {!token && (
            <>
              <NavLink className="nav-link" to="/login" onClick={closeMenu}>
                Login
              </NavLink>

              <Link className="btn btn-danger btn-sm" to="/register" onClick={closeMenu}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

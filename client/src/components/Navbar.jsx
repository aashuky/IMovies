
import { Link, NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand fw-bold text-danger" to="/">
        IMovies
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarMenu"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarMenu">
        <div className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
          <NavLink className="nav-link" to="/">
            Home
          </NavLink>

          <NavLink className="nav-link" to="/movies">
            Movies
          </NavLink>

          {token && (
            <>
              <NavLink className="nav-link" to="/bookings">
                My Bookings
              </NavLink>

              <NavLink className="nav-link" to="/watchlist">
                Watchlist
              </NavLink>
{user?.role === "admin" && (
  <NavLink className="nav-link" to="/admin">
    Admin Dashboard
  </NavLink>
)}
              <button
                className="btn btn-outline-light btn-sm"
                onClick={logout}
              >
                Logout
              </button>
            </>
          )}

          {!token && (
            <>
              <NavLink className="nav-link" to="/login">
                Login
              </NavLink>

              <Link className="btn btn-danger btn-sm" to="/register">
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

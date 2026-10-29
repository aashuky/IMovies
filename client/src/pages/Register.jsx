
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const defaultRoute = user.role === "admin" ? "/admin" : "/home";
      const requestedRoute = location.state?.from?.pathname;
      const destination = requestedRoute === "/admin" && user.role !== "admin"
        ? defaultRoute
        : requestedRoute || defaultRoute;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container py-5">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="hero-eyebrow mb-2">A BETTER WAY TO GO TO THE MOVIES</p>
        <h1 className="fw-bold mb-2">Create your account</h1>
        <p className="text-secondary mb-4">
          Save films, choose your seats and keep every booking in one place.
        </p>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <label className="form-label" htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          className="form-control mb-3"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <label className="form-label" htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          className="form-control mb-3"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label className="form-label" htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          className="form-control mb-4"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button className="btn btn-danger w-100" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-3 mb-0 text-center">
          Already registered? <Link to="/login" state={location.state}>Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;

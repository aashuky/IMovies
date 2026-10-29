
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);
      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container py-5">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="hero-eyebrow mb-2">YOUR NEXT MOVIE NIGHT STARTS HERE</p>
        <h1 className="fw-bold mb-2">Welcome back</h1>
        <p className="text-secondary mb-4">
          Sign in to book seats and keep your watchlist close.
        </p>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <label className="form-label" htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          className="form-control mb-3"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label className="form-label" htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          className="form-control mb-4"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button className="btn btn-danger w-100" disabled={loading}>
          {loading ? "Signing you in..." : "Sign in"}
        </button>

        <p className="mt-3 mb-0 text-center">
          Don't have an account? <Link to="/register" state={location.state}>Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

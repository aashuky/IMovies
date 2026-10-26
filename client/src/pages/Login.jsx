
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
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

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container py-5">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="fw-bold mb-2">Welcome Back</h2>
        <p className="text-secondary mb-4">Login to your IMovies account.</p>

        {error && <p className="text-danger">{error}</p>}

        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control mb-3"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control mb-4"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button className="btn btn-danger w-100" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-3 mb-0 text-center">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

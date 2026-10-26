
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
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
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container py-5">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2 className="fw-bold mb-2">Create Account</h2>
        <p className="text-secondary mb-4">Join IMovies today.</p>

        {error && <p className="text-danger">{error}</p>}

        <label className="form-label">Full Name</label>
        <input
          className="form-control mb-3"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

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
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <button className="btn btn-danger w-100" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="mt-3 mb-0 text-center">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;

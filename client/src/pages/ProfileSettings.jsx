import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { applyTheme, getSavedTheme } from "../services/theme";

function ProfileSettings() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [theme, setTheme] = useState(getSavedTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/auth/me")
      .then((response) => {
        if (active) {
          setForm({
            name: response.data.user.name || "",
            email: response.data.user.email || "",
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              "Could not load your profile. Please sign in again."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
      };
      if (passwordForm.newPassword) {
        payload.currentPassword = passwordForm.currentPassword;
        payload.newPassword = passwordForm.newPassword;
      }

      const response = await api.patch("/auth/me", payload);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setForm({
        name: response.data.user.name,
        email: response.data.user.email,
      });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setNotice("Your profile has been updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const changeTheme = (event) => {
    const nextTheme = applyTheme(event.target.checked ? "dark" : "light");
    setTheme(nextTheme);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <main className="container py-5 page-enter">
      <header className="mb-4 d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <p className="hero-eyebrow mb-2">YOUR ACCOUNT</p>
          <h1 className="fw-bold mb-2">Profile & settings</h1>
          <p className="text-secondary mb-0">
            Update your details and choose how IMovies looks on your devices.
          </p>
        </div>
        <button type="button" className="btn btn-outline-danger" onClick={logout}>
          Logout
        </button>
      </header>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <div className="profile-settings-grid">
        <section className="settings-card">
          <h2 className="h4 mb-4">Profile details</h2>
          {loading ? (
            <p className="text-secondary">Loading your profile...</p>
          ) : (
            <form onSubmit={saveProfile}>
              <label className="form-label" htmlFor="profile-name">Full name</label>
              <input
                id="profile-name"
                className="form-control mb-3"
                autoComplete="name"
                minLength={2}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
              <label className="form-label" htmlFor="profile-email">Email address</label>
              <input
                id="profile-email"
                type="email"
                className="form-control mb-4"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />

              <h3 className="h5 mt-4 mb-3">Change password</h3>
              <p className="small text-secondary">
                Leave these fields blank to keep your current password.
              </p>
              <label className="form-label" htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                className="form-control mb-3"
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
                }
              />
              <label className="form-label" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                className="form-control mb-4"
                autoComplete="new-password"
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm({ ...passwordForm, newPassword: event.target.value })
                }
              />
              <button className="btn btn-premium" disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </button>
            </form>
          )}
        </section>

        <section className="settings-card appearance-settings">
          <p className="hero-eyebrow mb-2">DISPLAY</p>
          <h2 className="h4 mb-2">Appearance</h2>
          <p className="text-secondary">
            Deep black is the default cinema experience. You can switch to a
            lighter theme at any time.
          </p>
          <label className="theme-toggle-row" htmlFor="dark-mode">
            <span>
              <strong>Dark mode</strong>
              <small>Use the deep-black IMovies theme</small>
            </span>
            <input
              id="dark-mode"
              type="checkbox"
              role="switch"
              checked={theme === "dark"}
              onChange={changeTheme}
            />
          </label>
        </section>
      </div>
    </main>
  );
}

export default ProfileSettings;

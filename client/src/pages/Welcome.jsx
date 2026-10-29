import { Navigate, useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  if (localStorage.getItem("token")) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="welcome-page page-enter">
      <section className="welcome-hero" aria-labelledby="welcome-title">
        <div className="welcome-glow welcome-glow-one" />
        <div className="welcome-glow welcome-glow-two" />
        <div className="welcome-content">
          <p className="welcome-kicker"><span>●</span> THE BIG SCREEN, YOUR WAY</p>
          <h1 id="welcome-title">Welcome to <span>iMovies</span></h1>
          <p className="welcome-copy">
            Discover new releases, choose the perfect theatre, and reserve your favourite seats in a few simple steps.
          </p>
          <div className="welcome-actions">
            <button type="button" className="btn btn-premium" onClick={() => navigate("/login")}>
              Sign in <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="btn btn-glass" onClick={() => navigate("/register")}>
              Create an account
            </button>
          </div>
          <p className="welcome-note">New here? Signing up takes less than a minute.</p>
        </div>
        <div className="welcome-reel" aria-hidden="true">
          <div className="reel-hole" /><div className="reel-hole" /><div className="reel-hole" />
          <div className="reel-hole" /><div className="reel-core" /><div className="reel-hole" />
          <div className="reel-hole" /><div className="reel-hole" /><div className="reel-hole" />
        </div>
        <div className="welcome-stats" aria-label="iMovies benefits">
          <div><strong>Movies</strong><span>Browse & discover</span></div>
          <div><strong>Theatres</strong><span>Find a venue</span></div>
          <div><strong>Seats</strong><span>Book with ease</span></div>
        </div>
      </section>
    </main>
  );
}

export default Welcome;

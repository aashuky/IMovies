import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { fallbackPoster, handlePosterError } from "../services/poster";

function getCurrentUserId() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.id;
  } catch {
    return null;
  }
}

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: "8", comment: "" });
  const [watchlisted, setWatchlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const loadReviews = async () => {
    const response = await api.get(`/reviews/movie/${id}`);
    setReviews(response.data.reviews || []);
  };

  useEffect(() => {
    let active = true;

    const loadMovie = async () => {
      try {
        const response = await api.get(`/movies/${id}`);
        if (active) setMovie(response.data.movie);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message || "Could not load this movie."
          );
        }
      } finally {
        if (active) setLoading(false);
      }

      try {
        const response = await api.get(`/reviews/movie/${id}`);
        if (active) setReviews(response.data.reviews || []);
      } catch (requestError) {
        if (active) {
          setReviewError(
            requestError.response?.data?.message || "Could not load reviews."
          );
        }
      }

      if (localStorage.getItem("token")) {
        try {
          const response = await api.get("/watchlist");
          if (active) {
            setWatchlisted(
              (response.data.watchlist || []).some(
                (item) => (item.movieId?._id || item.movieId) === id
              )
            );
          }
        } catch {
          if (active) setReviewError("Could not check your watchlist status.");
        }
      }
    };

    loadMovie();
    return () => {
      active = false;
    };
  }, [id]);

  const toggleWatchlist = async () => {
    setError("");
    try {
      if (watchlisted) {
        await api.delete(`/watchlist/${id}`);
        setWatchlisted(false);
      } else {
        await api.post("/watchlist", { movieId: id });
        setWatchlisted(true);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not update your watchlist."
      );
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewError("");
    setReviewNotice("");
    setReviewLoading(true);
    try {
      await api.post("/reviews", {
        movieId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      setReviewForm({ rating: "8", comment: "" });
      await loadReviews();
      setReviewNotice("Your review has been added.");
    } catch (requestError) {
      setReviewError(
        requestError.response?.data?.message || "Could not submit your review."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    setReviewError("");
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((current) => current.filter((review) => review._id !== reviewId));
      setReviewNotice("Your review has been removed.");
    } catch (requestError) {
      setReviewError(
        requestError.response?.data?.message || "Could not remove your review."
      );
    }
  };

  if (loading) return <main className="container py-5">Loading movie...</main>;

  if (error || !movie) {
    return (
      <div className="container py-5">
        <p className="text-danger">{error || "Movie not found."}</p>
        <Link to="/movies" className="btn btn-glass">Back to movies</Link>
      </div>
    );
  }

  const genres = Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre;

  return (
    <main className="container py-5 page-enter">
      <div className="row g-4 g-lg-5 align-items-start">
        <div className="col-sm-5 col-lg-4">
          <img
            src={movie.poster || fallbackPoster(movie.title)}
            alt={`${movie.title} poster`}
            className="img-fluid rounded-4 details-poster"
            onError={(event) => handlePosterError(event, movie.title)}
          />
        </div>
        <div className="col-lg-8">
          <p className="hero-eyebrow mb-2">NOW SHOWING ON IMOVIES</p>
          <h1 className="display-5 fw-bold">{movie.title}</h1>
          <p className="text-secondary">
            {[movie.language, movie.duration && `${movie.duration} min`, genres]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="movie-rating mb-3">
            ★ {Number(movie.rating) > 0 ? Number(movie.rating).toFixed(1) : "Not rated"}
          </p>
          <h2 className="h5 mt-4">About the movie</h2>
          <p className="text-secondary movie-description">
            {movie.description || "No description available."}
          </p>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          <div className="d-flex flex-wrap gap-3 mt-4">
            <Link to={`/movies/${movie._id}/shows`} className="btn btn-premium btn-lg">
              Book tickets <span aria-hidden="true">→</span>
            </Link>
            {isLoggedIn ? (
              <button
                type="button"
                className="btn btn-glass btn-lg"
                onClick={toggleWatchlist}
              >
                {watchlisted ? "✓ In your watchlist" : "+ Add to watchlist"}
              </button>
            ) : (
              <Link
                to="/login"
                state={{ from: { pathname: `/movies/${movie._id}` } }}
                className="btn btn-glass btn-lg"
              >
                Sign in to save
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="reviews-section mt-5 pt-4">
        <div className="section-heading">
          <div>
            <p className="hero-eyebrow mb-2">AUDIENCE NOTES</p>
            <h2>Reviews <span className="text-secondary">({reviews.length})</span></h2>
          </div>
        </div>

        {isLoggedIn ? (
          <form className="review-form mb-4" onSubmit={submitReview}>
            <label className="form-label" htmlFor="review-rating">Your rating</label>
            <select
              id="review-rating"
              className="form-select review-rating-select"
              value={reviewForm.rating}
              onChange={(event) =>
                setReviewForm({ ...reviewForm, rating: event.target.value })
              }
            >
              {Array.from({ length: 10 }, (_, index) => 10 - index).map((rating) => (
                <option key={rating} value={rating}>{rating} / 10</option>
              ))}
            </select>
            <label className="form-label mt-3" htmlFor="review-comment">Your review</label>
            <textarea
              id="review-comment"
              className="form-control"
              rows="3"
              maxLength={1000}
              placeholder="What did you think?"
              value={reviewForm.comment}
              onChange={(event) =>
                setReviewForm({ ...reviewForm, comment: event.target.value })
              }
            />
            <button className="btn btn-premium mt-3" disabled={reviewLoading}>
              {reviewLoading ? "Posting..." : "Post review"}
            </button>
          </form>
        ) : (
          <p className="text-secondary">
            <Link to="/login">Sign in</Link> to share your review.
          </p>
        )}

        {reviewError && <p className="text-danger" role="alert">{reviewError}</p>}
        {reviewNotice && <p className="text-success" role="status">{reviewNotice}</p>}
        {reviews.length === 0 && !reviewError && (
          <p className="text-secondary">No reviews yet. Be the first to share one.</p>
        )}
        <div className="review-list">
          {reviews.map((review) => (
            <article className="review-card" key={review._id}>
              <div className="d-flex justify-content-between gap-3">
                <strong>{review.userId?.name || "Movie fan"}</strong>
                <span className="movie-rating">★ {review.rating}/10</span>
              </div>
              {review.comment && <p className="text-secondary mb-2">{review.comment}</p>}
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-secondary">
                  {review.createdAt && !Number.isNaN(new Date(review.createdAt).getTime())
                    ? new Date(review.createdAt).toLocaleDateString()
                    : ""}
                </small>
                {review.userId?._id === getCurrentUserId() && (
                  <button
                    className="btn btn-link btn-sm text-danger p-0"
                    onClick={() => deleteReview(review._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default MovieDetails;

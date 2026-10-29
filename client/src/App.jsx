import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SeatSelection from "./pages/SeatSelection";
import MyBookings from "./pages/MyBookings";
import Watchlist from "./pages/Watchlist";
import AdminDashboard from "./pages/AdminDashboard";
import ShowSelection from "./pages/ShowSelection";
import ProfileSettings from "./pages/ProfileSettings";
import Theaters from "./pages/Theaters";
import TheaterProducts from "./pages/TheaterProducts";
import MyOrders from "./pages/MyOrders";
import Welcome from "./pages/Welcome";

function RequireAuth({ children, adminOnly = false }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isWelcomeScreen = location.pathname === "/";

  return (
    <div className="app-layout">
        {!isWelcomeScreen && <Navbar />}

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bookings" element={<RequireAuth><MyBookings /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><MyOrders /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfileSettings /></RequireAuth>} />
          <Route path="/shows/:showId/seats" element={<RequireAuth><SeatSelection /></RequireAuth>} />
          <Route path="/" element={<Welcome />} />
          <Route path="/home" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/theaters" element={<Theaters />} />
          <Route path="/theaters/:theaterId/products" element={<TheaterProducts />} />
          <Route path="/watchlist" element={<RequireAuth><Watchlist /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth adminOnly><AdminDashboard /></RequireAuth>} />
          <Route
            path="/movies/:id/shows"
            element={<ShowSelection />}
          />

          <Route
            path="*"
            element={<div className="container py-5">Page not found.</div>}
          />
        </Routes>

        {!isWelcomeScreen && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

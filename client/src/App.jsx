import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />

        <Routes>
          <Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/bookings" element={<MyBookings />} />
<Route path="/shows/:showId/seats" element={<SeatSelection />} />
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
<Route path="/watchlist" element={<Watchlist />} />
<Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/movies/:id/shows"
            element={
              <div className="container py-5">
                Show selection page next step mein banayenge.
              </div>
            }
          />

          <Route
            path="*"
            element={<div className="container py-5">Page not found.</div>}
          />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
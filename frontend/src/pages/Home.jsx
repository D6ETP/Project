import React, { useState, useEffect } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings([
      {
        id: 1,
        origin: "Pune",
        destination: "Mumbai",
        date: "2026-06-05",
        seatNumber: "A12",
        price: 500,
      },
      {
        id: 2,
        origin: "Delhi",
        destination: "Agra",
        date: "2026-06-06",
        seatNumber: "B7",
        price: 800,
      },
      {
        id: 3,
        origin: "Bangalore",
        destination: "Goa",
        date: "2026-06-07",
        seatNumber: "C3",
        price: 1200,
      },
    ]);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    navigate("/schedules", {
      state: {
        from,
        to,
        date,
      },
    });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1>Travel Smarter With Tour Booking</h1>
          <p>
            Book buses, explore routes, and manage your journeys effortlessly.
          </p>

          <form className="search-card" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <button type="submit">
              Search Buses
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stat-box">
          <h3>500+</h3>
          <p>Buses</p>
        </div>

        <div className="stat-box">
          <h3>120+</h3>
          <p>Routes</p>
        </div>

        <div className="stat-box">
          <h3>20K+</h3>
          <p>Passengers</p>
        </div>

        <div className="stat-box">
          <h3>99%</h3>
          <p>Satisfaction</p>
        </div>
      </section>

      {/* Journeys */}
      <section className="journeys-section">
        <h2>My Upcoming Journeys</h2>

        {isAuthenticated ? (
          bookings.length > 0 ? (
            <div className="journey-grid">
              {bookings.map((b) => (
                <div className="journey-card" key={b.id}>
                  <div className="journey-header">
                    <h4>
                      {b.origin} → {b.destination}
                    </h4>
                  </div>

                  <div className="journey-body">
                    <p>
                      <strong>Date:</strong> {b.date}
                    </p>

                    <p>
                      <strong>Seat:</strong> {b.seatNumber}
                    </p>

                    <p>
                      <strong>Fare:</strong> ₹{b.price}
                    </p>
                  </div>

                  <button className="details-btn">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No upcoming journeys found.</p>
          )
        ) : (
          <p>Please login to view your bookings.</p>
        )}
      </section>
    </div>
  );
}

export default Home;
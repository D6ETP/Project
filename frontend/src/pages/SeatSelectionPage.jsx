import SeatGrid from "../components/SeatGrid";
import { useNavigate } from "react-router-dom";
import useBooking from "../hooks/useBooking";
import "../pages/SeatSelectionPage.css";
function SeatSelectionPage() {

  const navigate = useNavigate();

  const { selectedSeats } =
    useBooking();

  return (
  <div className="seat-page">

    <div className="container py-4">

      <h2 className="seat-title text-center mb-4">
        💺 Select Your Seats
      </h2>

      <div className="seat-container">

        {/* Legend */}

        <div className="legend-box">

          <div className="legend-item">
            <div className="legend-seat available-seat"></div>
            <span>Available</span>
          </div>

          <div className="legend-item">
            <div className="legend-seat booked-seat"></div>
            <span>Booked</span>
          </div>

          <div className="legend-item">
            <div className="legend-seat selected-seat"></div>
            <span>Selected</span>
          </div>

        </div>

        <SeatGrid />

      </div>

      <div className="seat-summary text-center">

        <h4 className="selected-seat-text">

          Selected Seats :
          {" "}

          {selectedSeats.length > 0
            ? selectedSeats.join(", ")
            : "None"}

        </h4>

        <button
          disabled={
            selectedSeats.length === 0
          }
          className="btn btn-primary continue-btn mt-3"
          onClick={() =>
            navigate("/booking")
          }
        >
          Continue Booking →
        </button>

      </div>

    </div>

  </div>
);
}
export default SeatSelectionPage;
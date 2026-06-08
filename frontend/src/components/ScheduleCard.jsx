import { useNavigate } from "react-router-dom";
import useBooking from "../hooks/useBooking";
import "../pages/ScheduleCard.css";
function ScheduleCard({ bus }) {
  const navigate = useNavigate();

  const { setSelectedBus } =
    useBooking();

  const handleBook = () => {
    setSelectedBus(bus);
    navigate("/seats");
  };

  return (
    <div className="card schedule-card shadow-sm mb-4">

      <div className="row g-0 align-items-center">

        {/* Bus Image */}

        <div className="col-lg-3">

          <img
            src={bus.image}
            alt={bus.busName}
            className="bus-image"
          />

        </div>

        {/* Bus Details */}

        <div className="col-lg-5">

          <div className="card-body">

            <h3 className="fw-bold">
              {bus.busName}
            </h3>

            <p className="route-text">
              {bus.from} ➜ {bus.to}
            </p>

            <div className="mb-2">

              <span className="badge bg-primary me-2">
                {bus.busType}
              </span>

              <span className="badge bg-success">
                ⭐ {bus.rating}
              </span>

            </div>

            <div className="row mt-3">

              <div className="col-4">

                <small>
                  Departure
                </small>

                <h6>
                  {bus.departure}
                </h6>

              </div>

              <div className="col-4">

                <small>
                  Arrival
                </small>

                <h6>
                  {bus.arrival}
                </h6>

              </div>

              <div className="col-4">

                <small>
                  Seats
                </small>

                <h6>
                  {bus.availableSeats}
                </h6>

              </div>

            </div>

          </div>

        </div>
        <div className="mt-2">

  <small className="text-muted">
    Duration
  </small>

  <h6>
    {bus.duration}
  </h6>

</div>

        {/* Price */}

       <div className="col-lg-2 text-center">

  <div className="fare">
    ₹{bus.fare}
  </div>

  <small className="text-muted">
    Per Seat
  </small>

  <div className="mt-2">

    <span className="badge bg-warning text-dark">
      Fast Booking
    </span>

  </div>

</div>

        {/* Button */}

        <div className="col-lg-2 text-center">

          <button
            className="btn btn-primary btn-lg"
            onClick={handleBook}
          >
            Select Seats
          </button>

        </div>

      </div>

    </div>
  );
}

export default ScheduleCard;
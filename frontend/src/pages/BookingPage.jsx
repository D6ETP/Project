import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useBooking from "../hooks/useBooking";
import { createBooking } from "../services/bookingService";
import "../pages/BookingPage.css";

function BookingPage() {
  const navigate = useNavigate();

  const { selectedBus, selectedSeats } = useBooking();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  if (!selectedBus) {
    return (
      <div className="container mt-5">
        <h2>No Bus Selected</h2>
      </div>
    );
  }

  const totalAmount =
    selectedSeats.length * selectedBus.fare;

  const handleBooking = () => {
    if (!name || !mobile || !email) {
      alert("Please fill all details");
      return;
    }

    const booking = {
      passenger: name,
      mobile,
      email,
      busName: selectedBus.busName,
      route: `${selectedBus.from} → ${selectedBus.to}`,
      seats: selectedSeats,
      amount: totalAmount,
      bookingDate: new Date().toLocaleDateString(),
    };

    createBooking(booking);

    navigate("/success");
  };

 return (
  <div className="booking-page">

    <div className="container py-5">

      <div className="row g-4">

        {/* LEFT */}

        <div className="col-lg-8">

          <div className="card booking-card p-4">

            <h2 className="booking-title mb-4">
              Passenger Details
            </h2>

            <input
              type="text"
              className="form-control booking-input mb-3"
              placeholder="Passenger Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <input
              type="text"
              className="form-control booking-input mb-3"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) =>
                setMobile(e.target.value)
              }
            />

            <input
              type="email"
              className="form-control booking-input mb-3"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <button
              className="btn confirm-btn mt-3"
              onClick={handleBooking}
            >
              Confirm Booking
            </button>

          </div>

        </div>

        {/* RIGHT */}

        <div className="col-lg-4">

          <div className="summary-card">

            <h4>
              Booking Summary
            </h4>

            <hr />

            <p>
              <strong>
                Bus :
              </strong>
              {" "}
              {selectedBus.busName}
            </p>

            <p>
              <strong>
                Route :
              </strong>
              {" "}
              {selectedBus.from}
              {" → "}
              {selectedBus.to}
            </p>

            <p>
              <strong>
                Seats :
              </strong>
              {" "}
              {selectedSeats.join(", ")}
            </p>

            <p>
              <strong>
                Fare :
              </strong>
              {" "}
              ₹{selectedBus.fare}
            </p>

            <hr />

            <div className="text-center">

              <div className="total-amount">
                ₹{totalAmount}
              </div>

              <small>
                Total Payable
              </small>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
);
}

export default BookingPage;
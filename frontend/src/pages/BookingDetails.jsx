import { useLocation, useNavigate } from "react-router-dom";
import "./BookingDetails.css";

function BookingDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state;

  if (!bookingData) {
    return <h2>No Booking Details Found</h2>;
  }

  const { package: pkg, customer } = bookingData;

  const totalPrice =
    pkg.price * Number(customer.travelers);

  const handleConfirmBooking = () => {
  const existingBookings =
    JSON.parse(localStorage.getItem("bookings")) || [];

  const newBooking = {
    bookingId: "BK" + Date.now(),
    package: pkg,
    customer: customer,
    totalPrice,
    status: "Confirmed",
    rating: 0,
    review: "",
  };

  existingBookings.push(newBooking);

  localStorage.setItem(
    "bookings",
    JSON.stringify(existingBookings)
  );

  alert("🎉 Booking Confirmed Successfully!");

  navigate("/my-bookings");
};

  return (
    <div className="booking-container">
      <div className="booking-card">

        <h1>🚌 Booking Summary</h1>

        <img
          src={pkg.image}
          alt={pkg.name}
          className="booking-image"
        />

        <div className="section">
          <h2>📦 Package Details</h2>

          <p><strong>Package:</strong> {pkg.name}</p>

          <p><strong>Location:</strong> {pkg.location}</p>

          <p><strong>Price Per Person:</strong> ₹{pkg.price}</p>
        </div>

        <div className="section">
          <h2>👤 Customer Details</h2>

          <p><strong>Name:</strong> {customer.name}</p>

          <p><strong>Age:</strong> {customer.age}</p>

          <p><strong>Mobile:</strong> {customer.mobile}</p>

          <p><strong>Email:</strong> {customer.email}</p>
        </div>

        <div className="section">
          <h2>🗓 Travel Information</h2>

          <p>
            <strong>Travel Date:</strong>{" "}
            {customer.date}
          </p>

          <p>
            <strong>Travelers:</strong>{" "}
            {customer.travelers}
          </p>
        </div>

        <div className="total-price">
          Total Amount: ₹{totalPrice}
        </div>

        <div className="buttons">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <button
            className="confirm-btn"
            onClick={handleConfirmBooking}
          >
            Confirm Booking
          </button>
        </div>

      </div>
    </div>
  );
}

export default BookingDetails;
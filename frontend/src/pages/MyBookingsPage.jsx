import {
  getBookings,
  cancelBooking,
} from "../services/bookingService";
import "../pages/MyBookingsPage.css";
import { useState } from "react";

function MyBookingsPage() {

  const [bookings, setBookings] =
    useState(getBookings());

  const handleCancel = (id) => {

    const confirmDelete =
      window.confirm(
        "Cancel this booking?"
      );

    if (!confirmDelete) return;

    cancelBooking(id);

    setBookings(getBookings());
  };

  return (
  <div className="my-bookings-page">

    <div className="container py-4">

      <h2 className="page-title mb-4">
        🎫 My Bookings
      </h2>

      {bookings.length === 0 ? (

        <div className="empty-bookings">
          <h4>No bookings found.</h4>
        </div>

      ) : (

        bookings.map((booking) => (

          <div
            className="card booking-history-card mb-4"
            key={booking.id}
          >

            <div className="booking-header">

              <h4 className="mb-0">
                {booking.busName}
              </h4>

            </div>

            <div className="booking-body">

              <p>
                <strong>Passenger:</strong>
                {" "}
                {booking.passenger}
              </p>

              <p>
                <strong>Route:</strong>
                {" "}
                {booking.route}
              </p>

              <p>
                <strong>Seats:</strong>
                {" "}
                {booking.seats.join(", ")}
              </p>

              <p>
                <strong>Date:</strong>
                {" "}
                {booking.bookingDate}
              </p>

              <div className="d-flex justify-content-between align-items-center">

                <div className="amount-text">
                  ₹{booking.amount}
                </div>

                <button
                  className="btn btn-danger cancel-btn"
                  onClick={() =>
                    handleCancel(
                      booking.id
                    )
                  }
                >
                  Cancel Booking
                </button>

              </div>

            </div>

          </div>

        ))

      )}

    </div>

  </div>
);
}
export default MyBookingsPage;
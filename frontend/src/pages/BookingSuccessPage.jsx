import { Link } from "react-router-dom";
import { getBookings } from "../services/bookingService";

import jsPDF from "jspdf";
import "../pages/BookingSuccessPage.css";

import { QRCodeCanvas } from "qrcode.react";

function BookingSuccessPage() {

  const bookings =
    getBookings();

  const booking =
    bookings[bookings.length - 1];

  if (!booking) {
    return (
     <div className="success-page">
  <div className="container">
    </div>
        <h2>No Booking Found</h2>
      </div>
    );
  }

  const downloadPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(20);

    doc.text(
      "Bus Ticket",
      80,
      20
    );

    doc.setFontSize(12);

    doc.text(
      `Booking ID: ${booking.bookingId}`,
      20,
      50
    );

    doc.text(
      `Passenger: ${booking.passenger}`,
      20,
      70
    );

    doc.text(
      `Bus: ${booking.busName}`,
      20,
      90
    );

    doc.text(
      `Route: ${booking.route}`,
      20,
      110
    );

    doc.text(
      `Seats: ${booking.seats.join(", ")}`,
      20,
      130
    );

    doc.text(
      `Amount: ₹${booking.amount}`,
      20,
      150
    );

    doc.save(
      `${booking.bookingId}.pdf`
    );
  };

  return (
    <div className="container mt-5">

      <div className="card shadow ticket-card">

        <div className="card-body p-5">

          <div className="text-center">

            <h1 className="text-success">
              🎉 Booking Successful
            </h1>

            <p>
              Ticket Booked Successfully
            </p>

          </div>

          <hr />

          <div className="row">

            <div className="col-md-6 booking-details">

              <h5>Booking ID</h5>

              <p className="booking-id">
  {booking.bookingId}
</p>

              <h5>Passenger</h5>

              <p>
                {booking.passenger}
              </p>

              <h5>Bus Name</h5>

              <p>
                {booking.busName}
              </p>

              <h5>Route</h5>

              <p>
                {booking.route}
              </p>

              <h5>Seats</h5>

              <p>
                {booking.seats.join(", ")}
              </p>

              <h5>Amount</h5>

              <p className="amount">
                ₹{booking.amount}
              </p>

            </div>

            <div className="col-md-6 qr-section">

              <h5>
                Ticket QR Code
              </h5>

              <QRCodeCanvas
                value={booking.bookingId}
                size={180}
              />

            </div>

          </div>

          <hr />

          <div className="ticket-buttons">

            <button
              className="btn btn-success me-2"
              onClick={downloadPDF}
            >
              Download Ticket
            </button>

            <button
              className="btn btn-primary me-2"
              onClick={() =>
                window.print()
              }
            >
              Print Ticket
            </button>

            <Link
              to="/mybookings"
              className="btn btn-warning me-2"
            >
              My Bookings
            </Link>

            <Link
              to="/home"
              className="btn btn-secondary"
            >
              Home
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default BookingSuccessPage;
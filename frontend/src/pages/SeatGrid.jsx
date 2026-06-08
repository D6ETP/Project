import useBooking from "../hooks/useBooking";

function SeatGrid() {
  const {
    selectedSeats,
    setSelectedSeats,
  } = useBooking();

  const bookedSeats = [
    3, 4, 8, 9, 15, 16, 24, 25,
  ];

  const toggleSeat = (seatNo) => {
    if (bookedSeats.includes(seatNo))
      return;

    if (
      selectedSeats.includes(seatNo)
    ) {
      setSelectedSeats(
        selectedSeats.filter(
          (seat) => seat !== seatNo
        )
      );
    } else {
      setSelectedSeats([
        ...selectedSeats,
        seatNo,
      ]);
    }
  };

  const getSeatClass = (seatNo) => {
    if (
      bookedSeats.includes(seatNo)
    ) {
      return "seat booked";
    }

    if (
      selectedSeats.includes(seatNo)
    ) {
      return "seat selected";
    }

    return "seat available";
  };

  return (
    <div className="bus-container">

      <div className="driver-box">
        🧑‍✈️ Driver
      </div>

      {Array.from({
        length: 8,
      }).map((_, row) => {

        const seat1 =
          row * 4 + 1;

        const seat2 =
          row * 4 + 2;

        const seat3 =
          row * 4 + 3;

        const seat4 =
          row * 4 + 4;

        return (
          <div
            className="seat-row"
            key={row}
          >

            <button
              className={getSeatClass(
                seat1
              )}
              onClick={() =>
                toggleSeat(seat1)
              }
            >
              {seat1}
            </button>

            <button
              className={getSeatClass(
                seat2
              )}
              onClick={() =>
                toggleSeat(seat2)
              }
            >
              {seat2}
            </button>

            <div className="aisle"></div>

            <button
              className={getSeatClass(
                seat3
              )}
              onClick={() =>
                toggleSeat(seat3)
              }
            >
              {seat3}
            </button>

            <button
              className={getSeatClass(
                seat4
              )}
              onClick={() =>
                toggleSeat(seat4)
              }
            >
              {seat4}
            </button>

          </div>
        );
      })}
    </div>
  );
}

export default SeatGrid;
const STORAGE_KEY = "busBookings";

export const getBookings = () => {
  return JSON.parse(
    localStorage.getItem(STORAGE_KEY)
  ) || [];
};

export const createBooking = (booking) => {
  const bookings = getBookings();

  const bookingId =
    "BK" +
    Math.floor(
      100000 +
      Math.random() * 900000
    );

  bookings.push({
    id: Date.now(),
    bookingId,
    ...booking,
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(bookings)
  );
};

export const cancelBooking = (id) => {
  const bookings = getBookings();

  const updatedBookings =
    bookings.filter(
      (booking) =>
        booking.id !== id
    );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedBookings)
  );
};
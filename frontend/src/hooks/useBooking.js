import { useContext } from "react";
import { BookingContext } from "../context/BookingContext";

const useBooking = () => {
  return useContext(BookingContext);
};

export default useBooking;
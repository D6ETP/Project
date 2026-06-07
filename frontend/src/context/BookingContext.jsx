import { createContext, useState } from "react";

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  return (
    <BookingContext.Provider
      value={{
        selectedBus,
        setSelectedBus,
        selectedSeats,
        setSelectedSeats,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
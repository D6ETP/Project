const schedules = [
  {
    id: 1,
    busName: "Omkar Travels",
    from: "Pune",
    to: "Jalgaon",
    departure: "08:00 AM",
    arrival: "12:00 PM",
    fare: 500,
    rating: 4.5,
    busType: "AC Sleeper",
    availableSeats: 20,
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
  },

  {
    id: 2,
    busName: "Sangitam Travels",
    from: "Pune",
    to: "Dhule",
    departure: "09:00 AM",
    arrival: "07:00 PM",
    fare: 1200,
    rating: 4.2,
    busType: "AC Seater",
    availableSeats: 18,
    image:
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e",
  },

  {
    id: 3,
    busName: "Shivaji Travels",
    from: "Mumbai",
    to: "Nashik",
    departure: "07:00 AM",
    arrival: "11:00 AM",
    fare: 650,
    rating: 4.8,
    busType: "Luxury AC",
    availableSeats: 12,
    image:
      "https://images.unsplash.com/photo-1519003722824-194d4455a60c",
  },

  {
    id: 4,
    busName: "Balaji Travels",
    from: "Mumbai",
    to: "Nagpur",
    departure: "10:00 PM",
    arrival: "08:00 AM",
    fare: 1500,
    rating: 4.6,
    busType: "Sleeper",
    availableSeats: 16,
    image:
      "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e",
  }
];

export const getSchedules = () => schedules;
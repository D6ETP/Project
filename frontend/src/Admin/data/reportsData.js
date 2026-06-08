// Monthly revenue data
export const revenueData = [
  { month: "January",  bookings: 320, revenue: 125000 },
  { month: "February", bookings: 410, revenue: 158000 },
  { month: "March",    bookings: 530, revenue: 212000 },
  { month: "April",    bookings: 480, revenue: 195000 },
  { month: "May",      bookings: 610, revenue: 240000 },
  { month: "June",     bookings: 390, revenue: 160000 },
];

// Weekly revenue data (last 4 weeks)
export const weeklyData = [
  { week: "Week 1 (1–7 Jun)",  bookings: 95,  revenue: 38000 },
  { week: "Week 2 (8–14 Jun)", bookings: 110, revenue: 44000 },
  { week: "Week 3 (15–21 Jun)",bookings: 88,  revenue: 35000 },
  { week: "Week 4 (22–28 Jun)",bookings: 97,  revenue: 43000 },
];

// Daily revenue data (last 7 days)
export const dailyData = [
  { day: "Mon, 2 Jun",  bookings: 32, revenue: 12800 },
  { day: "Tue, 3 Jun",  bookings: 47, revenue: 18800 },
  { day: "Wed, 4 Jun",  bookings: 38, revenue: 15200 },
  { day: "Thu, 5 Jun",  bookings: 55, revenue: 22000 },
  { day: "Fri, 6 Jun",  bookings: 61, revenue: 24400 },
  { day: "Sat, 7 Jun",  bookings: 42, revenue: 16800 },
  { day: "Sun, 8 Jun",  bookings: 28, revenue: 11200 },
];

// Popular routes
export const popularRoutes = [
  { route: "Pune → Mumbai",  bookings: 420 },
  { route: "Mumbai → Goa",   bookings: 310 },
  { route: "Pune → Nashik",  bookings: 250 },
  { route: "Nagpur → Pune",  bookings: 180 },
];

// Helper — format number as ₹
export const formatRupees = (n) =>
  "₹" + n.toLocaleString("en-IN");

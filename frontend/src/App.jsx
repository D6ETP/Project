import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// User Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import BookingPage from "./pages/BookingPage";
import SchedulePage from "./pages/SchedulePage";
import PassengerProfile from "./pages/PassengerProfile";
import MyBookingsPage from "./pages/MyBookingsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import PackagesPage from "./pages/PackagesPage";
import PackageForm from "./pages/PackageForm";
import BookingDetails from "./pages/BookingDetails";

// Admin Pages
import AdminLogin from "./Admin/login/AdminLogin";
import AdminDashboard from "./Admin/AdminDash/AdminDashboard";
import BusManagement from "./Admin/BusManagement/BusManagement";
import RouteManagement from "./Admin/Routes/RouteManagement";
import ScheduleManagement from "./Admin/Schedules/ScheduleManagement";
import PassengerManagement from "./Admin/Passengers/PassengerManagement";
import Reports from "./Admin/Reports/Reports";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { BookingProvider } from "./context/BookingContext";

function AppContent() {
  const { isLoading, userRole } = useAuth();

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading...</div>;
  }

  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/signup" element={<Signup />} />

      {/* ========== ADMIN ROUTES ========== */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      <Route path="/admin/dashboard" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
        
      <Route path="/admin/buses" element={
        <AdminProtectedRoute>
          <BusManagement />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/routes" element={
        <AdminProtectedRoute>
          <RouteManagement />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/schedules" element={
        <AdminProtectedRoute>
          <ScheduleManagement />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/passengers" element={
        <AdminProtectedRoute>
          <PassengerManagement />
        </AdminProtectedRoute>
      } />
      
      <Route path="/admin/reports" element={
        <AdminProtectedRoute>
          <Reports />
        </AdminProtectedRoute>
      } />

      {/* ========== USER PROTECTED ROUTES ========== */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      <Route path="/home" element={
        <ProtectedRoute>
          <Navbar />
          <Home />
          <Footer />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Navbar />
          <PassengerProfile />
          <Footer />
        </ProtectedRoute>
      } />

      <Route path="/packages" element={
        <ProtectedRoute>
          <Navbar />
          <PackagesPage />
          <Footer />
        </ProtectedRoute>
      } />

      <Route path="/packages-form" element={
        <ProtectedRoute>
          <Navbar />
          <PackageForm />
          <Footer />
        </ProtectedRoute>
      } />

      <Route path="/booking-details" element={
        <ProtectedRoute>
          <Navbar />
          <BookingDetails />
          <Footer />
        </ProtectedRoute>
      } />

      <Route path="/mybookings" element={
        <ProtectedRoute>
          <Navbar />
          <MyBookingsPage />
          <Footer />
        </ProtectedRoute>
      } />

      <Route path="/schedules" element={
        <ProtectedRoute>
          <Navbar />
          <SchedulePage />
          <Footer />
        </ProtectedRoute>
      } />

      <Route path="/seats" element={
        <ProtectedRoute>
          <Navbar />
          <SeatSelectionPage />
          <Footer />
        </ProtectedRoute>
      } />

      <Route path="/booking" element={
        <ProtectedRoute>
          <Navbar />
          <BookingPage />
          <Footer />
        </ProtectedRoute>
      } />

      <Route path="/success" element={
        <ProtectedRoute>
          <Navbar />
          <BookingSuccessPage />
          <Footer />
        </ProtectedRoute>
      } />

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <AppContent />
          <ToastContainer />
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;


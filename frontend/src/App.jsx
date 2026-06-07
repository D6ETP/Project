import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import BookingPage from "./pages/BookingPage";
import SchedulePage from "./pages/SchedulePage";
import PassengerProfile from "./pages/PassengerProfile";  
import PaymentPage from "./pages/PaymentPage";
import TicketPage from "./pages/TicketPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";
import MyBookingsPage from "./pages/MyBookingsPage";
import { BookingProvider } from "./context/BookingContext";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
function App() {

  const loading = useAuth();

  if(loading)
  {
    return null;
  }

  return (
    <Router>
      <AuthProvider>
         <BookingProvider>
        <Navbar />  
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected home routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Protected passenger routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PassengerProfile />
              </ProtectedRoute>
            }
          />

          {/* Payment & Ticket (protected) */}
          {/* <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          /> */}

            //Booking Route
           <Route
            path="/mybookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          // schedule route
          <Route
          path="/schedules"
          element={
            <ProtectedRoute>
              <SchedulePage/>
            </ProtectedRoute>
          }/>

          //Select Seat Route
          <Route
          path="/seats"
          element={
            <ProtectedRoute>
              <SeatSelectionPage/>
            </ProtectedRoute>
          }/>

          <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingPage/>
            </ProtectedRoute>
          }/>

          <Route 
          path="/success"
          element={
            <ProtectedRoute>
              <BookingSuccessPage/>
            </ProtectedRoute>
          }/>
          </Routes>
        <Footer />
        <ToastContainer />
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;


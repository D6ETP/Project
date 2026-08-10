import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChatbotWidget from './components/ChatbotWidget';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import SearchBuses from './pages/SearchBuses';
import SeatSelection from './pages/SeatSelection';
import PassengerDetails from './pages/PassengerDetails';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';
import UserDashboard from './pages/UserDashboard';
import Profile from './pages/Profile';
import AdminPortal from './pages/AdminPortal';
import AdminReports from './pages/AdminReports';
import { AuthProvider, AuthContext } from './context/AuthContext';

// ─── Protected Route ──────────────────────────────────────────────────────────
// Handles:
//  1. While token is being decoded from localStorage → show spinner
//  2. No user in context (no token / expired) → redirect to /login
//  3. Wrong role → redirect to /search
const ProtectedRoute = ({ children, roles }) => {
    const { user, isLoading } = React.useContext(AuthContext);

    // Wait until AuthContext finishes reading localStorage before deciding
    if (isLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="text-muted">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // No user = no token or expired token → force login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role-based access control
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/search" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-vh-100 d-flex flex-column bg-light">
                    <Navbar />
                    {/* ── AI Chatbot — always visible on every page ── */}
                    <ChatbotWidget />
                    <div className="flex-grow-1" style={{ marginTop: '64px' }}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/search" element={<SearchBuses />} />

                            {/* Protected User Routes */}
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Landing />
                                </ProtectedRoute>
                            } />
                            <Route path="/seats" element={
                                <ProtectedRoute>
                                    <SeatSelection />
                                </ProtectedRoute>
                            } />
                            <Route path="/passenger-details" element={
                                <ProtectedRoute>
                                    <PassengerDetails />
                                </ProtectedRoute>
                            } />
                            <Route path="/payment" element={
                                <ProtectedRoute>
                                    <Payment />
                                </ProtectedRoute>
                            } />
                            <Route path="/ticket" element={
                                <ProtectedRoute>
                                    <Ticket />
                                </ProtectedRoute>
                            } />
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />

                            {/* Admin Routes */}
                            <Route path="/admin" element={
                                <ProtectedRoute roles={['ROLE_ADMIN']}>
                                    <AdminPortal />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/reports" element={
                                <ProtectedRoute roles={['ROLE_ADMIN']}>
                                    <AdminReports />
                                </ProtectedRoute>
                            } />

                            {/* Catch-all: any unknown URL redirects to /login if not authenticated */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </div>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

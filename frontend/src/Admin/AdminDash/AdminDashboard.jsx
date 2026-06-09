import React from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import { dashboardStats, recentBookings } from "../data/dashboard.js";


function AdminDashboard() {
  return (
    <div className="dashboard-container">
      <AdminSidebar />

      <div className="main-content">
        <AdminNavbar title="Dashboard" />

        <div className="page-body">

          {/* Welcome */}
          <div className="p-4 mb-4 rounded-3 text-white" style={{ background: "linear-gradient(135deg, #1e40af, #0ea5e9)" }}>
            <h4 className="mb-1">Welcome Back, Admin 👋</h4>
            <p className="mb-0 opacity-75">Here's what's happening with your bus network today.</p>
          </div>

          {/* Stat Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-6 col-lg-3">
              <div className="stat-card">
                <div className="stat-info">
                  <h6>Total Buses</h6>
                  <h3>{dashboardStats.totalBuses}</h3>
                </div>
                <div className="stat-icon icon-blue">
                  <i className="bi bi-bus-front-fill" />
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="stat-card">
                <div className="stat-info">
                  <h6>Total Routes</h6>
                  <h3>{dashboardStats.totalRoutes}</h3>
                </div>
                <div className="stat-icon icon-green">
                  <i className="bi bi-signpost-split-fill" />
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="stat-card">
                <div className="stat-info">
                  <h6>Total Passengers</h6>
                  <h3>{dashboardStats.totalPassengers}</h3>
                </div>
                <div className="stat-icon icon-amber">
                  <i className="bi bi-people-fill" />
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-3">
              <div className="stat-card">
                <div className="stat-info">
                  <h6>Total Bookings</h6>
                  <h3>{dashboardStats.totalBookings}</h3>
                </div>
                <div className="stat-icon icon-red">
                  <i className="bi bi-ticket-perforated-fill" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="page-card">
            <div className="page-card-header">
              <h5>Recent Bookings</h5>
              <span className="badge bg-primary rounded-pill">{recentBookings.length} records</span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 admin-table">
                <thead>
                  <tr>
                    <th className="ps-4">Booking ID</th>
                    <th>Passenger</th>
                    <th>Route</th>
                    <th>Seats</th>
                    <th className="pe-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="ps-4 fw-bold text-primary">{b.id}</td>
                      <td>{b.name}</td>
                      <td>{b.route}</td>
                      <td>{b.seats}</td>
                      <td className="pe-4">
                        <span className={`badge rounded-pill px-3 py-2 ${
                          b.status === "Confirmed" ? "bg-success" :
                          b.status === "Pending"   ? "bg-warning text-dark" :
                                                     "bg-danger"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
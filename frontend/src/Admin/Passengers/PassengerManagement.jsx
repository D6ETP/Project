import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import passengerData from "../data/passengerData";

function PassengerManagement() {
  const [passengers, setPassengers] = useState(passengerData);
  const [search, setSearch] = useState("");

  const handleDelete = (id) => {
    if (window.confirm("Delete this passenger?")) setPassengers(passengers.filter((p) => p.id !== id));
  };

  const handleView = (p) => {
    alert(`Name: ${p.name}\nEmail: ${p.email}\nPhone: ${p.phone}\nRoute: ${p.route}\nSeat: ${p.seat}`);
  };

  const filtered = passengers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.route.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <AdminNavbar title="Manage Passengers" />
        <div className="page-body">
          <div className="page-card">

            <div className="page-card-header">
              <h5>Passenger Management</h5>
              <input
                type="text"
                className="form-control"
                placeholder="Search passenger..."
                style={{ width: "220px" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 admin-table">
                <thead>
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Route</th>
                    <th>Seat</th>
                    <th>Status</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="ps-4 fw-bold text-primary">{p.id}</td>
                      <td>{p.name}</td>
                      <td>{p.email}</td>
                      <td>{p.phone}</td>
                      <td>{p.route}</td>
                      <td>{p.seat}</td>
                      <td>
                        <span className={`badge ${
                          p.status === "Confirmed" ? "bg-success" :
                          p.status === "Pending"   ? "bg-warning text-dark" :
                                                     "bg-danger"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="pe-4">
                        <div className="btn-group">
                          <button className="btn btn-info btn-sm" onClick={() => handleView(p)}>
                            <i className="bi bi-eye" />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default PassengerManagement;
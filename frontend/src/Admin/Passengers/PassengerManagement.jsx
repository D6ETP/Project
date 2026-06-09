import React, { useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";
import passengerData from "../data/passengerData";

function PassengerManagement() {
  const [passengers, setPassengers] = useState(passengerData);
  const [search, setSearch] = useState("");

  const filtered = passengers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const handleDelete = (id) => {
    if (window.confirm("Delete this passenger?")) {
      setPassengers(passengers.filter((p) => p.id !== id));
    }
  };

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <AdminNavbar title="Manage Passengers" />
        <div className="page-body" style={{ padding: "30px" }}>
          <div className="page-card" style={{ background: "white", borderRadius: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            {/* Header */}
            <div className="page-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
              <h5 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>Passengers List</h5>
              <span className="badge" style={{ background: "#3b82f6", color: "white", padding: "5px 15px", borderRadius: "20px" }}>
                {filtered.length} total
              </span>
            </div>

            {/* Search */}
            <div style={{ padding: "20px", borderBottom: "1px solid #e5e7eb" }}>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "10px 15px", border: "1px solid #d1d5db", borderRadius: "5px", fontSize: "14px" }}
              />
            </div>

            {/* Table */}
            <div className="table-responsive" style={{ overflowX: "auto" }}>
              <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>ID</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>Name</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>Email</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>Phone</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontWeight: "bold", color: "#374151" }}>Bookings</th>
                    <th style={{ padding: "12px 20px", textAlign: "center", fontWeight: "bold", color: "#374151" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((passenger) => (
                    <tr key={passenger.id} style={{ borderBottom: "1px solid #e5e7eb", "&:hover": { background: "#f9fafb" } }}>
                      <td style={{ padding: "12px 20px", color: "#6b7280" }}>{passenger.id}</td>
                      <td style={{ padding: "12px 20px", color: "#111827" }}>{passenger.name}</td>
                      <td style={{ padding: "12px 20px", color: "#6b7280" }}>{passenger.email}</td>
                      <td style={{ padding: "12px 20px", color: "#6b7280" }}>{passenger.phone}</td>
                      <td style={{ padding: "12px 20px", color: "#6b7280" }}>{passenger.bookings}</td>
                      <td style={{ padding: "12px 20px", textAlign: "center" }}>
                        <button
                          onClick={() => handleDelete(passenger.id)}
                          style={{ padding: "5px 15px", background: "#f87171", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "12px" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                No passengers found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default PassengerManagement;

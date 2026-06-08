import React, { useState } from "react";
import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";
import busData from "../data/busData";

function BusManagement() {
  const [buses, setBuses] = useState(busData);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [search, setSearch] = useState("");

  const emptyForm = { busName: "", busNumber: "", busType: "AC Sleeper", seats: "", source: "", destination: "", status: "Active" };
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAdd = () => { setEditingBus(null); setFormData(emptyForm); setShowModal(true); };
  const openEdit = (bus) => { setEditingBus(bus); setFormData(bus); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingBus(null); };

  const handleSave = () => {
    if (!formData.busName || !formData.busNumber) return alert("Fill all required fields");
    if (editingBus) {
      setBuses(buses.map((b) => (b.id === editingBus.id ? { ...b, ...formData } : b)));
    } else {
      const newId = "BUS" + String(buses.length + 1).padStart(3, "0");
      setBuses([...buses, { id: newId, ...formData }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this bus?")) setBuses(buses.filter((b) => b.id !== id));
  };

  const filtered = buses.filter((b) =>
    b.busName.toLowerCase().includes(search.toLowerCase()) ||
    b.busNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <AdminNavbar title="Manage Buses" />
        <div className="page-body">
          <div className="page-card">

            {/* Header */}
            <div className="page-card-header">
              <h5>Bus Management</h5>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search bus..."
                  style={{ width: "200px" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={openAdd}>
                  <i className="bi bi-plus-circle me-2" />Add Bus
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 admin-table">
                <thead>
                  <tr>
                    <th className="ps-4">Bus ID</th>
                    <th>Bus Name</th>
                    <th>Bus Number</th>
                    <th>Type</th>
                    <th>Seats</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((bus) => (
                    <tr key={bus.id}>
                      <td className="ps-4 fw-bold text-primary">{bus.id}</td>
                      <td>{bus.busName}</td>
                      <td>{bus.busNumber}</td>
                      <td>{bus.busType}</td>
                      <td>{bus.seats}</td>
                      <td>{bus.source}</td>
                      <td>{bus.destination}</td>
                      <td>
                        <span className={`badge ${bus.status === "Active" ? "bg-success" : "bg-danger"}`}>
                          {bus.status}
                        </span>
                      </td>
                      <td className="pe-4">
                        <div className="btn-group">
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(bus)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(bus.id)}>
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

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingBus ? "Edit Bus" : "Add New Bus"}</h5>
                  <button className="btn-close" onClick={closeModal} />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Bus Name</label>
                      <input type="text" name="busName" className="form-control" value={formData.busName} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Bus Number</label>
                      <input type="text" name="busNumber" className="form-control" value={formData.busNumber} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Bus Type</label>
                      <select name="busType" className="form-select" value={formData.busType} onChange={handleChange}>
                        <option>AC Sleeper</option>
                        <option>AC Seater</option>
                        <option>Non AC</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Total Seats</label>
                      <input type="number" name="seats" className="form-control" value={formData.seats} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Source</label>
                      <input type="text" name="source" className="form-control" value={formData.source} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Destination</label>
                      <input type="text" name="destination" className="form-control" value={formData.destination} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave}>Save Bus</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </>
  );
}

export default BusManagement;
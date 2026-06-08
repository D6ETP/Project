import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";
import scheduleData from "../data/schedule";

function ScheduleManagement() {
  const [schedules, setSchedules] = useState(scheduleData);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [search, setSearch] = useState("");

  const emptyForm = { busName: "", source: "", destination: "", departure: "", arrival: "", seats: "", status: "Active" };
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAdd = () => { setEditingSchedule(null); setFormData(emptyForm); setShowModal(true); };
  const openEdit = (s) => { setEditingSchedule(s); setFormData(s); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingSchedule(null); };

  const handleSave = () => {
    if (!formData.busName || !formData.source || !formData.destination || !formData.departure || !formData.arrival)
      return alert("Please fill all fields");
    if (editingSchedule) {
      setSchedules(schedules.map((s) => (s.id === editingSchedule.id ? { ...s, ...formData } : s)));
    } else {
      const newId = "SCH" + String(schedules.length + 1).padStart(3, "0");
      setSchedules([...schedules, { id: newId, ...formData }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this schedule?")) setSchedules(schedules.filter((s) => s.id !== id));
  };

  const filtered = schedules.filter((s) =>
    s.busName.toLowerCase().includes(search.toLowerCase()) ||
    s.source.toLowerCase().includes(search.toLowerCase()) ||
    s.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <AdminNavbar title="Manage Schedules" />
        <div className="page-body">
          <div className="page-card">

            <div className="page-card-header">
              <h5>Schedule Management</h5>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  style={{ width: "200px" }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" onClick={openAdd}>
                  <i className="bi bi-plus-circle me-2" />Add Schedule
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 admin-table">
                <thead>
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Bus Name</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id}>
                      <td className="ps-4 fw-bold text-primary">{s.id}</td>
                      <td>{s.busName}</td>
                      <td>{s.source}</td>
                      <td>{s.destination}</td>
                      <td>{s.departure}</td>
                      <td>{s.arrival}</td>
                      <td>{s.seats}</td>
                      <td>
                        <span className={`badge ${s.status === "Active" ? "bg-success" : "bg-danger"}`}>{s.status}</span>
                      </td>
                      <td className="pe-4">
                        <div className="btn-group">
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(s)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
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

      {showModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingSchedule ? "Edit Schedule" : "Add Schedule"}</h5>
                  <button className="btn-close" onClick={closeModal} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Bus Name</label>
                    <input type="text" name="busName" className="form-control" value={formData.busName} onChange={handleChange} />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Source</label>
                      <input type="text" name="source" className="form-control" value={formData.source} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Destination</label>
                      <input type="text" name="destination" className="form-control" value={formData.destination} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Departure Time</label>
                      <input type="time" name="departure" className="form-control" value={formData.departure} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Arrival Time</label>
                      <input type="time" name="arrival" className="form-control" value={formData.arrival} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Available Seats</label>
                    <input type="number" name="seats" className="form-control" value={formData.seats} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave}>Save Schedule</button>
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

export default ScheduleManagement;
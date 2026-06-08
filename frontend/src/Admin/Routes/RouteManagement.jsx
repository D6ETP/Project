import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminNavbar from "../components/AdminNavbar.jsx";
import routeData from "../data/routeData.js";

function RouteManagement() {
  const [routes, setRoutes] = useState(routeData);
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const emptyForm = { source: "", destination: "", distance: "", duration: "" };
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAdd = () => { setEditingRoute(null); setFormData(emptyForm); setShowModal(true); };
  const openEdit = (route) => { setEditingRoute(route); setFormData(route); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingRoute(null); };

  const handleSave = () => {
    if (!formData.source || !formData.destination) return alert("Fill all fields");
    if (editingRoute) {
      setRoutes(routes.map((r) => (r.id === editingRoute.id ? { ...r, ...formData } : r)));
    } else {
      const newId = "RT" + String(routes.length + 1).padStart(3, "0");
      setRoutes([...routes, { id: newId, ...formData }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this route?")) setRoutes(routes.filter((r) => r.id !== id));
  };

  return (
    <>
      <AdminSidebar />
      <div className="main-content">
        <AdminNavbar title="Manage Routes" />
        <div className="page-body">
          <div className="page-card">

            <div className="page-card-header">
              <h5>Route Management</h5>
              <button className="btn btn-primary" onClick={openAdd}>
                <i className="bi bi-plus-circle me-2" />Add Route
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 admin-table">
                <thead>
                  <tr>
                    <th className="ps-4">Route ID</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Distance</th>
                    <th>Duration</th>
                    <th className="pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route) => (
                    <tr key={route.id}>
                      <td className="ps-4 fw-bold text-primary">{route.id}</td>
                      <td>{route.source}</td>
                      <td>{route.destination}</td>
                      <td>{route.distance}</td>
                      <td>{route.duration}</td>
                      <td className="pe-4">
                        <div className="btn-group">
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(route)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(route.id)}>
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
          <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingRoute ? "Edit Route" : "Add Route"}</h5>
                  <button className="btn-close" onClick={closeModal} />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Source</label>
                    <input type="text" name="source" className="form-control" value={formData.source} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Destination</label>
                    <input type="text" name="destination" className="form-control" value={formData.destination} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Distance</label>
                    <input type="text" name="distance" className="form-control" value={formData.distance} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Duration</label>
                    <input type="text" name="duration" className="form-control" value={formData.duration} onChange={handleChange} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave}>Save Route</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} />
        </>
      )}
    </>
  );
}

export default RouteManagement;

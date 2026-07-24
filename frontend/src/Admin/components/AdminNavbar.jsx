import React from "react";

function AdminNavbar({ title = "Dashboard" }) {
  return (
    <div className="admin-navbar">
      <div className="d-flex align-items-center gap-3">
        {/* Hamburger — only visible on mobile (below lg) */}
        <button
          className="btn btn-light border d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileSidebar"
          aria-controls="mobileSidebar"
        >
          <i className="bi bi-list fs-5" />
        </button>

        <h5 className="mb-0">{title}</h5>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Search — hidden on small screens */}
        <div className="input-group d-none d-md-flex" style={{ width: "220px" }}>
          <span className="input-group-text bg-light border-end-0">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0 bg-light"
            placeholder="Search..."
          />
        </div>

        {/* Bell */}
        <div className="position-relative">
          <button className="btn btn-light border">
            <i className="bi bi-bell" />
          </button>
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "9px" }}
          >
            3
          </span>
        </div>

        {/* Profile dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-light border dropdown-toggle d-flex align-items-center gap-2"
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-person-circle" />
            <span className="d-none d-sm-inline">Admin</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
            <li><button className="dropdown-item"><i className="bi bi-person me-2" />Profile</button></li>
            <li><button className="dropdown-item"><i className="bi bi-gear me-2" />Settings</button></li>
            <li><hr className="dropdown-divider" /></li>
            <li><button className="dropdown-item text-danger"><i className="bi bi-box-arrow-right me-2" />Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminNavbar;
import React from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard",         path: "/admin/dashboard",  icon: "bi-speedometer2" },
  { name: "Manage Buses",      path: "/admin/buses",      icon: "bi-bus-front" },
  { name: "Manage Routes",     path: "/admin/routes",     icon: "bi-signpost-split" },
  { name: "Manage Schedules",  path: "/admin/schedules",  icon: "bi-calendar-event" },
  { name: "Manage Passengers", path: "/admin/passengers", icon: "bi-people" },
  { name: "Reports",           path: "/admin/reports",    icon: "bi-bar-chart-line" },
];

/* Shared sidebar content — used by both desktop and mobile */
function SidebarContent() {
  return (
    <>
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-brand-icon">
          <i className="bi bi-bus-front-fill" />
        </div>
        <div>
          <div className="sb-brand-name">BusAdmin</div>
          <div className="sb-brand-sub">Management System</div>
        </div>
      </div>

      {/* Menu */}
      <div className="sb-menu-label">Main Menu</div>
      <ul className="sb-nav">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `sb-link${isActive ? " active" : ""}`}
            >
              <i className={`bi ${item.icon}`} />
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sb-divider" />

      {/* Logout */}
      <ul className="sb-nav">
        <li>
          <NavLink to="/admin/login" className="sb-link" style={{ color: "#f87171" }}>
            <i className="bi bi-box-arrow-right" />
            Logout
          </NavLink>
        </li>
      </ul>
    </>
  );
}

function AdminSidebar() {
  return (
    <>
      {/* Desktop sidebar — fixed, visible on lg+ screens */}
      <div className="admin-sidebar d-none d-lg-flex">
        <SidebarContent />
      </div>

      {/* Mobile sidebar — Bootstrap offcanvas, slides in from left */}
      <div
        className="offcanvas offcanvas-start admin-sidebar"
        tabIndex="-1"
        id="mobileSidebar"
        aria-labelledby="mobileSidebarLabel"
      >
        <div className="offcanvas-header border-0 pb-0">
          <span id="mobileSidebarLabel" />
          <button
            type="button"
            className="btn-close btn-close-white"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body p-0">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;
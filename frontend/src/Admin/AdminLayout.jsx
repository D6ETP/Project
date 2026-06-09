import React from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminNavbar from "./components/AdminNavbar";

function AdminLayout({ children, title }) {
  return (
    <div className="dashboard-container" style={{ display: "flex" }}>
      <AdminSidebar />
      <div className="main-content" style={{ flex: 1 }}>
        <AdminNavbar title={title} />
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;

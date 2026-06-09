import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminNavbar({ title }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-navbar" style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
        {title}
      </div>
      <button 
        onClick={handleLogout}
        style={{ padding: "10px 20px", background: "#f87171", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
      >
        Logout
      </button>
    </div>
  );
}

export default AdminNavbar;

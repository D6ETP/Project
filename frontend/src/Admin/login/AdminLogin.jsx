import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    // Simple dummy auth — any email + password works
    setError("");
    navigate("/admin/dashboard");
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <i className="bi bi-bus-front-fill" />
          </div>
          <h1 className="login-brand-name">BusAdmin</h1>
        </div>
        <p className="login-tagline">
          Manage your entire bus network from one place.
          <br />
          Routes, schedules, passengers &amp; more.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Admin Login</h2>
          <p className="login-sub">Sign in to your dashboard</p>

          {error && (
            <div className="login-error">
              <i className="bi bi-exclamation-circle me-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email</label>
              <div className="login-input-wrap">
                <i className="bi bi-envelope" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <i className="bi bi-lock" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="login-btn">
              <i className="bi bi-box-arrow-in-right me-2" />
              Login
            </button>
          </form>

          <p className="login-hint">
            Use any email &amp; password to continue
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
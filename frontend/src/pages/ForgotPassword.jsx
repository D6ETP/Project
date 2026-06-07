import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBus, FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.success(
      "Password reset link sent successfully!",
      {
        position: "top-center",
      }
    );

    setEmail("");
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">

        <div className="forgot-header">
          <FaBus className="forgot-icon" />

          <h2>Tour Booking</h2>

          <p>
            Enter your registered email address
            and we'll send you a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="forgot-btn"
          >
            <FaPaperPlane />
            Send Reset Link
          </button>

        </form>

        <div className="forgot-footer">
          Remember your password?

          <Link to="/login">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;
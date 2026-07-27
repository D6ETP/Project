import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBus, FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

import "./Signup.css";

function Signup() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {

    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {

      const response = await axios.post(
        "http://localhost:8081/auth/signup",
        {
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          gender: formData.gender,
          address: formData.address
        }
      );

      toast.success(response.data.message);

      navigate("/login");

    } catch (error) {

      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Server Error");
      }

    }

  };

  return (
    <div className="signup-container">

      <div className="signup-card">

        <div className="signup-header">

          <FaBus className="signup-icon" />

          <h2>Create Account</h2>

          <p>Start Your Journey With Us</p>

        </div>

        <form onSubmit={handleSignup}>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>

            <input
              type="tel"
              name="phone"
              placeholder="Enter Mobile Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Gender</label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

          </div>

          <div className="form-group">
            <label>Address</label>

            <textarea
              name="address"
              placeholder="Enter Address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <div className="password-box">

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>

            </div>

          </div>

          <div className="form-group">

            <label>Confirm Password</label>

            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>

          <button
            type="submit"
            className="signup-btn"
          >
            <FaUserPlus />
            Create Account
          </button>

        </form>

        <div className="login-text">
          Already have an account?
          <Link to="/login"> Login</Link>
        </div>

      </div>

    </div>
  );
}

export default Signup;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaBus, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {

    const response = await axios.post(
      "http://localhost:8081/auth/login",
      {
        email,
        password,
      }
    );

    const token = response.data.token;

    // Save JWT
    localStorage.setItem("token", token);
    localStorage.setItem("email",email);

    // Save user info (optional)
    login("user");

    toast.success("Login Successful");

    navigate("/home");

  } catch (error) {

    if (error.response) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Server Error");
    }

  }
};

  // const handleLogin = async (e) => {
  //   e.preventDefault();

  //   if (
  //     email === "admin@example.com" &&
  //     password === "admin123"
  //   ) {
  //     login("admin");
  //     toast.success("Welcome Admin!");
  //     navigate("/admin/dashboard");
  //   }
  //   else if (
  //     email === "user@example.com" &&
  //     password === "user123"
  //   ) {
  //     login("user");
  //     toast.success("Welcome Back!");
  //     navigate("/home");
  //   }
  //   else {
  //     toast.error("Invalid Email or Password");
  //   }
  // };

  return (
    <div className="login-container">

      <div className="login-card">
        
        <div className="login-header">
          <FaBus className="login-icon" />
          <h2>Easy Travel Planner</h2>
          <p>Plan Your Next Journey</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-box">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <span
                className="eye-icon"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword
                  ? <FaEyeSlash />
                  : <FaEye />}
              </span>

            </div>
          </div>

          <div className="remember-row">

            <label>
              <input type="checkbox" />
              Remember Me
            </label>

            <Link
              to="/forgot-password"
              className="forgot-link"
            >
              Forgot Password?
            </Link>

          </div>

          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>

        <div className="signup-text">
          Don't have an account?
          <Link to="/signup">
            Sign Up
          </Link>
        </div>

        <div className="admin-section">
          <p>
            Are you an admin? 
            <Link to="/admin/login">
               Login as Admin
            </Link>
          </p>
        </div>

        <div className="demo-box">
          <h6>Demo Accounts</h6>

          <p>
            <strong>Admin:</strong>
            admin@example.com /
            admin123
          </p>

          <p>
            <strong>User:</strong>
            user@example.com /
            user123
          </p>
        </div>

      </div>

    </div>
  );
}

export default Login;
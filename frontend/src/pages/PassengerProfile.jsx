import React, { useState } from "react";
import { FaUserCircle, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import "./PassengerProfile.css";

function PassengerProfile() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "9876543210",
    dob: "1995-05-15",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.success(
      "Profile Updated Successfully!",
      {
        position: "top-center",
      }
    );

    console.log(profile);
  };

  return (
    <div className="profile-container">

      <div className="profile-card">

        <div className="profile-header">

          <FaUserCircle className="profile-avatar" />

          <h2>Passenger Profile</h2>

          <p>
            Manage your account information
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date of Birth</label>

            <input
              type="date"
              name="dob"
              value={profile.dob}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="profile-btn"
          >
            <FaSave />
            Update Profile
          </button>

        </form>

      </div>

    </div>
  );
}

export default PassengerProfile;
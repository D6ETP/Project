import React, { useState, useEffect } from "react";
import { FaUserCircle, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import "./PassengerProfile.css";

function PassengerProfile() {

  const [profile, setProfile] = useState({
    id: "",
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login first.");
        return;
      }

      const response = await axios.get(
        "http://localhost:8082/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProfile(response.data);

    } catch (error) {

      console.log(error);

      if (error.response) {
        toast.error(error.response.data.message || "Unable to load profile");
      } else {
        toast.error("Unable to connect to User Service");
      }

    }

  };

  const handleChange = (e) => {

    const { name, value } = e.target;

    setProfile({
      ...profile,
      [name]: value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:8082/users",
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Profile Updated Successfully");

    } catch (error) {

      console.log(error);

      if (error.response) {
        toast.error(error.response.data.message || "Update Failed");
      } else {
        toast.error("Unable to connect to User Service");
      }

    }

  };

  return (

    <div className="profile-container">

      <div className="profile-card">

        <div className="profile-header">

          <FaUserCircle className="profile-avatar" />

          <h2>Passenger Profile</h2>

          <p>Manage your account information</p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              name="email"
              value={profile.email}
              readOnly
            />

          </div>

          <div className="form-group">

            <label>Phone</label>

            <input
              type="text"
              name="phone"
              value={profile.phone || ""}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label>Gender</label>

            <select
              name="gender"
              value={profile.gender || ""}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

          </div>

          <div className="form-group">

            <label>Date Of Birth</label>

            <input
              type="date"
              name="dateOfBirth"
              value={profile.dateOfBirth || ""}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label>Address</label>

            <textarea
              name="address"
              value={profile.address || ""}
              onChange={handleChange}
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
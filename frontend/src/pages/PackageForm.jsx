import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Form.css";

function PackageForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPackage = location.state;

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    mobile: "",
    email: "",
    travelers: 1,
    date: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    navigate("/booking-details", {
      state: {
        package: selectedPackage,
        customer: formData,
      },
    });
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <h1>🚌 Package Booking Form</h1>

        <div className="selected-package">
          <h2>{selectedPackage?.name}</h2>
          <p>📍 {selectedPackage?.location}</p>
          <p>💰 ₹{selectedPackage?.price}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            onChange={handleChange}
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            required
            onChange={handleChange}
          />

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            required
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            onChange={handleChange}
          />

          <input
            type="number"
            name="travelers"
            placeholder="Number of Travelers"
            min="1"
            required
            onChange={handleChange}
          />

          <input
            type="date"
            name="date"
            required
            onChange={handleChange}
          />

          <button type="submit">
            Continue Booking →
          </button>
        </form>
      </div>
    </div>
  );
}

export default PackageForm;
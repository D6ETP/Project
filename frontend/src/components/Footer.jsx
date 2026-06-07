import React from "react";
import { Link } from "react-router-dom";
import {
  FaBus,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope
} from "react-icons/fa";

import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="container">

        <div className="row">

          {/* Brand Section */}
          <div className="col-lg-4 col-md-6 mb-4">
            <h4 className="footer-brand">
              <FaBus className="me-2" />
              TourBooking
            </h4>

            <p className="footer-text">
              Discover amazing destinations and book your journeys
              with confidence. Fast, secure and reliable travel booking.
            </p>

            <div className="contact-info">
              <p>
                <FaMapMarkerAlt /> Pune, Maharashtra
              </p>

              <p>
                <FaPhoneAlt /> +91 98765 43210
              </p>

              <p>
                <FaEnvelope /> support@tourbooking.com
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Quick Links</h5>

            <ul className="footer-list">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/about" className="footer-link">
                  About
                </Link>
              </li>

              <li>
                <Link to="/contact" className="footer-link">
                  Contact
                </Link>
              </li>

              <li>
                <Link to="/schedule" className="footer-link">
                  Schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Support</h5>

            <ul className="footer-list">
              <li>
                <Link to="/terms" className="footer-link">
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link to="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link to="/faq" className="footer-link">
                  FAQ
                </Link>
              </li>

              <li>
                <Link to="/help" className="footer-link">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Follow Us</h5>

            <div className="social-icons">

              <a href="#">
                <FaFacebookF />
              </a>

              <a href="#">
                <FaInstagram />
              </a>

              <a href="#">
                <FaTwitter />
              </a>

              <a href="#">
                <FaLinkedinIn />
              </a>

            </div>

            <p className="newsletter-text">
              Stay updated with our latest tours and offers.
            </p>
          </div>

        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom text-center">
          © {new Date().getFullYear()} TourBooking.
          All Rights Reserved.
        </div>

      </div>

    </footer>
  );
}

export default Footer;
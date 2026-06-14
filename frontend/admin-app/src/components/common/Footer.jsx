import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
            Delicious food delivered to your doorstep. Experience the
            best culinary journey with DirectDine.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul className="footer-contact">
            <li>
              <Phone size={16} />
              <span>+1 234 567 890</span>
            </li>
            <li>
              <Mail size={16} />
              <span>contact@restaurant.com</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>123 Food Street, City</span>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Facebook">
              <FaFacebook size={24} />
            </a>

            <a href="#" className="social-link" aria-label="Twitter">
              <FaTwitter size={24} />
            </a>

            <a href="#" className="social-link" aria-label="Instagram">
              <FaInstagram size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 DirectDine. All rights reserved.</p>
      </div>
    </footer>
  );
};
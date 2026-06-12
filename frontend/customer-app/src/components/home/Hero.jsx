import { Link } from 'react-router-dom';
import { FaUtensils } from 'react-icons/fa';

export const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <h1>Delicious Food Delivered to Your Door</h1>
          <p>Order from the best restaurants in your area</p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary">
              <FaUtensils /> Order Now
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-placeholder">
            <span>🍔 🍕 🍜</span>
          </div>
        </div>
      </div>
    </section>
  );
};

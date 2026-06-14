import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUser, FaShoppingCart, FaBars, FaTimes, FaSignInAlt, FaGift } from 'react-icons/fa';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/menu', label: 'Menu', icon: FaBars },
    ...(isAuthenticated ? [{ path: '/rewards', label: 'Rewards', icon: FaGift }] : [])
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const cartCount = cartItems.length;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <h1>🍽️ Restaurant PWA</h1>
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`navbar-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          {isAuthenticated && <NotificationBell />}

          {/* Cart Icon with Count */}
          <Link to="/cart" className="navbar-cart">
            <FaShoppingCart size={24} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Login/Profile Button */}
          {isAuthenticated ? (
            <div className="navbar-user">
              <Link to="/profile" className="navbar-profile">
                <FaUser size={24} />
                <span>{user?.name || 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="navbar-logout">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-login">
              <FaSignInAlt size={20} />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Hamburger Menu */}
          <button
            className="navbar-hamburger"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar-mobile-menu">
          <ul className="mobile-nav-items">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                to="/cart"
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaShoppingCart size={20} />
                <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="mobile-nav-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaUser size={20} />
                    <span>Profile</span>
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="mobile-nav-link">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/login"
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaSignInAlt size={20} />
                  <span>Login</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};
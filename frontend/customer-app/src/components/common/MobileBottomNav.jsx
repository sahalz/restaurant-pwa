import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBars, FaShoppingCart, FaUser } from 'react-icons/fa';

export const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/menu', label: 'Menu', icon: FaBars },
    { path: '/cart', label: 'Cart', icon: FaShoppingCart },
    { path: '/profile', label: 'Profile', icon: FaUser },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <Icon size={24} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
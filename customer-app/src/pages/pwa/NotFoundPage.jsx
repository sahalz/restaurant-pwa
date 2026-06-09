import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import './NotFoundPage.css';

export const NotFoundPage = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-icon-wrap">
          <FaExclamationTriangle className="notfound-icon" />
        </div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          Oops! The page you are looking for doesn't exist or has been moved.
          Double-check the URL or go back to the homepage.
        </p>
        <Link to="/" className="notfound-btn">
          <FaHome /> Go to Homepage
        </Link>
      </div>
    </div>
  );
};

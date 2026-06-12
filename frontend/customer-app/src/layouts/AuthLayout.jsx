import { Outlet } from 'react-router-dom';  // 👈 add this import
import './AuthLayout.css';

export const AuthLayout = ({ children }) => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        {children || <Outlet />}  {/* 👈 change this */}
      </div>
    </div>
  );
};
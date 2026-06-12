import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { WelcomePage } from './pages/user/WelcomePage';
import { SignupPage } from './pages/user/SignupPage';
import { StaffDashboard } from './pages/admin/StaffDashboard';
import { ManagerDashboard } from './pages/admin/ManagerDashboard';


function App() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#667eea'
      }}>
        <div className="spinner" style={{
          border: '4px solid rgba(0, 0, 0, 0.1)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          borderLeftColor: '#667eea',
          animation: 'spin 1s linear infinite',
          marginRight: '12px'
        }} />
        Loading...
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Only allow staff (staff / manager / legacy admin) to access the dashboard
  const isStaff = isAuthenticated && (user?.role === 'staff' || user?.role === 'manager' || user?.role === 'admin');
  const isManager = isAuthenticated && (user?.role === 'manager' || user?.role === 'admin');

  return (
    <BrowserRouter>
      <Routes>
        {!isStaff ? (
          // Unauthenticated or Non-Staff Flow
          <>
            <Route element={<AuthLayout />}>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<WelcomePage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // Authenticated Staff / Manager Flow
          <>
            <Route path="/" element={isManager ? <ManagerDashboard /> : <StaffDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

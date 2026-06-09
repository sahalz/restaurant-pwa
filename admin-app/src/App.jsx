import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { WelcomePage } from './pages/user/WelcomePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';

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

  // Only allow staff (admin / manager) to access the dashboard
  const isStaff = isAuthenticated && (user?.role === 'admin' || user?.role === 'manager');

  return (
    <BrowserRouter>
      <Routes>
        {!isStaff ? (
          // Unauthenticated or Non-Staff Flow
          <>
            <Route path="/" element={<WelcomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // Authenticated Staff Flow
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

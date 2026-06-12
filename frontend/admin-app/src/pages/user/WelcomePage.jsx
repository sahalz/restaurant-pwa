import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export const WelcomePage = () => {
  const { login } = useAuth();

  // Admin / Staff credentials state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Email format is invalid';
    return null;
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setServerError('');

    const emailErr = validateEmail(adminEmail);
    const newErrors = {};
    if (emailErr) newErrors.email = emailErr;
    if (!adminPassword) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    const result = await login(adminEmail, adminPassword);
    setIsLoading(false);

    if (!result.success) {
      setServerError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-page" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(circle at 10% 20%, rgba(98, 114, 244, 0.9) 0%, rgba(147, 73, 247, 0.9) 90%)',
      padding: '40px 20px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Outfit", "Inter", system-ui, sans-serif'
    }}>
      {/* Decorative floating blurred blobs */}
      <div className="bg-blob-1" style={{
        position: 'absolute',
        top: '10%',
        left: '15%',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
      <div className="bg-blob-2" style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '350px',
        height: '350px',
        background: 'rgba(99, 102, 241, 0.3)',
        borderRadius: '50%',
        filter: 'blur(90px)',
        pointerEvents: 'none',
      }} />

      <div className="auth-container" style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '40px',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        <div className="auth-header" style={{ marginBottom: '28px', textAlign: 'center' }}>
          <span className="brand-logo-animated" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '12px' }}>🍽️</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            DirectDine Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Sign in as Staff or Manager
          </p>
        </div>

        {serverError && (
          <div className="error-banner" style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span> {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label htmlFor="admin-email" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Email Address</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <FaEnvelope className="input-icon" style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
              <input
                type="email"
                id="admin-email"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="staff@directdine.com"
                className={errors.email ? 'error' : ''}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 38px',
                  border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff'
                }}
                required
              />
            </div>
            {errors.email && <span className="error-message" style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="admin-password" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Password</label>
            <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FaKey className="input-icon" style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                placeholder="Enter password"
                className={errors.password ? 'error' : ''}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 38px',
                  border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff'
                }}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-message" style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.password}</span>}
          </div>

          <button type="submit" className="auth-button-premium" disabled={isLoading} style={{ marginTop: '10px' }}>
            {isLoading ? 'Signing in...' : 'Sign In to Portal'}
          </button>
        </form>
        
        <div className="auth-footer" style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            New staff member?{' '}
            <Link to="/signup" className="auth-link" style={{ color: '#4f46e5', fontWeight: 'bold', textDecoration: 'none' }}>
              Register Staff Account
            </Link>
          </p>
        </div>
      </div>

      {/* Styled Animations */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes floatSlowReverse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .bg-blob-1 {
          animation: floatSlow 10s infinite ease-in-out;
        }
        .bg-blob-2 {
          animation: floatSlowReverse 14s infinite ease-in-out;
        }
        .brand-logo-animated {
          animation: logoFloat 3.5s ease-in-out infinite;
        }
        .auth-button-premium {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: none;
          border-radius: 12px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
        }
        .auth-button-premium:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.45);
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
        }
        .auth-button-premium:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
        }
        .auth-button-premium:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }
        .input-wrapper input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12) !important;
        }
        .input-wrapper input.error {
          border-color: #ef4444 !important;
        }
        .input-wrapper input.error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12) !important;
        }
      `}</style>
    </div>
  );
};

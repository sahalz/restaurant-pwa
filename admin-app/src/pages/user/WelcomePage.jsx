import { useState } from 'react';
import { FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../layouts/AuthLayout.css';

export const WelcomePage = () => {
  const { login } = useAuth();

  // Admin state
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

    if (result.success) {
      // Authenticated successfully! App.jsx conditional routing directs them.
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="auth-page" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div className="auth-container" style={{
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        padding: '40px',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        animation: 'slideUp 0.4s ease-out forwards'
      }}>

        <div className="auth-form-view">
          <div className="auth-header">
            <span className="welcome-brand-logo">🍽️</span>
            <h1>DirectDine Admin</h1>
            <p style={{ marginTop: '4px' }}>Access management tools with password credentials</p>
          </div>

          {serverError && <div className="error-banner">{serverError}</div>}

          <form className="auth-form" onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label htmlFor="admin-email">Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" style={{ left: '12px' }} />
                <input
                  type="email"
                  id="admin-email"
                  value={adminEmail}
                  onChange={(e) => {
                    setAdminEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="admin@restaurantpwa.com"
                  className={errors.email ? 'error' : ''}
                  style={{ paddingLeft: '36px' }}
                  required
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <div className="input-wrapper">
                <FaKey className="input-icon" style={{ left: '12px' }} />
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
                  style={{ paddingLeft: '36px', paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ right: '12px' }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In as Admin'}
            </button>
          </form>
        </div>

      </div>

      <style>{`
        .welcome-brand-logo {
          font-size: 3.5rem;
          display: block;
          margin-bottom: 12px;
          text-align: center;
          animation: logoFloat 4s ease-in-out infinite;
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

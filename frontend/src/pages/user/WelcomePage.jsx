import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUserShield, FaArrowLeft, FaEnvelope, FaKey, FaArrowRight, FaRedo, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../layouts/AuthLayout.css';


export const WelcomePage = () => {
  const navigate = useNavigate();
  const { login, sendOTP, verifyOTP } = useAuth();

  // view state: 'role-selection' | 'customer' | 'admin'
  const [view, setView] = useState('role-selection');

  // Customer state
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Admin state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val) => {
    if (!val) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Email format is invalid';
    return null;
  };

  const handleReset = () => {
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setIsLoading(false);
  };

  const handleBackToRoles = () => {
    setView('role-selection');
    setOtpSent(false);
    setEmail('');
    setOtpToken('');
    setAdminEmail('');
    setAdminPassword('');
    handleReset();
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }
    setErrors({});

    setIsLoading(true);
    const result = await sendOTP(email);
    setIsLoading(false);

    if (result.success) {
      setOtpSent(true);
      setSuccessMessage('A 6-digit verification code has been sent to your email.');
    } else {
      setServerError(result.error);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!otpToken) {
      setErrors({ otpToken: 'OTP verification code is required' });
      return;
    }
    if (otpToken.length < 6) {
      setErrors({ otpToken: 'OTP code must be 6 digits' });
      return;
    }
    setErrors({});

    setIsLoading(true);
    const result = await verifyOTP(email, otpToken);
    setIsLoading(false);

    if (result.success) {
      // Auth status updates, conditional routing in App.jsx takes over.
    } else {
      setServerError(result.error);
    }
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
      // Authenticated successfully! Admin setup is handled elsewhere, conditional routing directs them.
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

        {/* VIEW 1: Role Selection */}
        {view === 'role-selection' && (
          <div className="role-selection-view">
            <div className="auth-header">
              <span className="welcome-brand-logo">🍽️</span>
              <h1>Welcome to DirectDine</h1>
              <p style={{ marginTop: '4px' }}>Please select your portal to continue</p>
            </div>

            <div className="roles-grid">
              <button
                className="role-card customer-role"
                onClick={() => {
                  setView('customer');
                  handleReset();
                }}
              >
                <div className="role-icon-box">
                  <FaUser />
                </div>
                <h3>Customer</h3>
                <p>Order food, track deliveries, and manage your profile</p>
              </button>

              <button
                className="role-card admin-role"
                onClick={() => {
                  setView('admin');
                  handleReset();
                }}
              >
                <div className="role-icon-box">
                  <FaUserShield />
                </div>
                <h3>Admin</h3>
                <p>Manage categories, menu options, and tickets</p>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: Customer OTP Flow */}
        {view === 'customer' && (
          <div className="auth-form-view">
            <button className="back-button" onClick={handleBackToRoles}>
              <FaArrowLeft /> Back to options
            </button>

            <div className="auth-header">
              <h1>Customer Login</h1>
              <p>Sign in instantly with a temporary email code</p>
            </div>

            {serverError && <div className="error-banner">{serverError}</div>}
            {successMessage && <div className="success-banner">{successMessage}</div>}

            {!otpSent ? (
              <form className="auth-form" onSubmit={handleSendOTP}>
                <div className="form-group">
                  <label htmlFor="customer-email">Email Address</label>
                  <div className="input-wrapper">
                    <FaEnvelope className="input-icon" style={{ left: '12px' }} />
                    <input
                      type="email"
                      id="customer-email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="name@example.com"
                      className={errors.email ? 'error' : ''}
                      style={{ paddingLeft: '36px' }}
                      required
                    />
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? 'Sending code...' : 'Get Verification Code'}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleVerifyOTP}>
                <div className="form-group">
                  <label htmlFor="otp-code">Verification Code (OTP)</label>
                  <div className="input-wrapper">
                    <FaKey className="input-icon" style={{ left: '12px' }} />
                    <input
                      type="text"
                      id="otp-code"
                      value={otpToken}
                      onChange={(e) => {
                        setOtpToken(e.target.value);
                        if (errors.otpToken) setErrors(prev => ({ ...prev, otpToken: '' }));
                      }}
                      placeholder="Enter 6-digit OTP code"
                      maxLength={6}
                      className={errors.otpToken ? 'error' : ''}
                      style={{ paddingLeft: '36px', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                      required
                    />
                  </div>
                  {errors.otpToken && <span className="error-message">{errors.otpToken}</span>}
                </div>

                <div className="welcome-otp-actions">
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="auth-button"
                    style={{ backgroundColor: '#e2e8f0', color: '#4a5568', flex: 1 }}
                    disabled={isLoading}
                  >
                    <FaRedo /> Resend
                  </button>
                  <button type="submit" className="auth-button" style={{ flex: 2 }} disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify & Log In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* VIEW 3: Administrator Flow */}
        {view === 'admin' && (
          <div className="auth-form-view">
            <button className="back-button" onClick={handleBackToRoles}>
              <FaArrowLeft /> Back to options
            </button>

            <div className="auth-header">
              <h1>Administrator Login</h1>
              <p>Access management tools with password credentials</p>
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
        )}

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
        .roles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 24px;
        }
        @media (max-width: 640px) {
          .roles-grid {
            grid-template-columns: 1fr;
          }
        }
        .role-card {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          outline: none;
        }
        .role-card:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        .role-icon-box {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          font-size: 1.2rem;
        }
        .role-card.admin-role .role-icon-box {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .role-card.admin-role:hover {
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        }
        .role-card h3 {
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          color: #1f2937;
          font-weight: 700;
        }
        .role-card p {
          margin: 0;
          font-size: 0.85rem;
          color: #6b7280;
          line-height: 1.4;
        }
        .welcome-otp-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .welcome-otp-actions button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};

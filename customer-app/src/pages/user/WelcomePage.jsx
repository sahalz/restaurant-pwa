import { useState } from 'react';
import { FaEnvelope, FaKey, FaRedo } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../layouts/AuthLayout.css';

export const WelcomePage = () => {
  const { sendOTP, verifyOTP } = useAuth();

  // Customer state
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);

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

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
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
            <h1>Welcome to DirectDine</h1>
            <p style={{ marginTop: '4px' }}>Sign in instantly with a temporary email code</p>
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

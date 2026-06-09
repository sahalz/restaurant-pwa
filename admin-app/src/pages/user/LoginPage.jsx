import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaKey, FaArrowRight, FaRedo } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, sendOTP, verifyOTP } = useAuth();
  
  // Tab state: 'customer' (OTP) vs 'staff' (Password)
  const [loginMethod, setLoginMethod] = useState('customer');
  
  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  
  // OTP flow status
  const [otpSent, setOtpSent] = useState(false);
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

  const handleTabChange = (method) => {
    setLoginMethod(method);
    setErrors({});
    setServerError('');
    setSuccessMessage('');
    setOtpSent(false);
    setOtpToken('');
    setPassword('');
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
      navigate('/');
    } else {
      setServerError(result.error);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setServerError('');

    const emailErr = validateEmail(email);
    const newErrors = {};
    if (emailErr) newErrors.email = emailErr;
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setServerError(result.error);
    }
  };

  return (
    <>
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Choose your login option below</p>
      </div>

      {/* Tabs */}
      <div className="auth-tabs" style={{
        display: 'flex',
        margin: '0 0 1.5rem 0',
        borderRadius: '8px',
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: '4px'
      }}>
        <button
          type="button"
          onClick={() => handleTabChange('customer')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: loginMethod === 'customer' ? '#667eea' : 'transparent',
            color: loginMethod === 'customer' ? '#fff' : '#666',
          }}
        >
          Customer (Email OTP)
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('staff')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: loginMethod === 'staff' ? '#667eea' : 'transparent',
            color: loginMethod === 'staff' ? '#fff' : '#666',
          }}
        >
          Staff / Admin (Password)
        </button>
      </div>

      {serverError && (
        <div className="error-banner" style={{
          backgroundColor: '#ffe3e3',
          color: '#e53e3e',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="success-banner" style={{
          backgroundColor: '#e6fffa',
          color: '#319795',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {successMessage}
        </div>
      )}

      {/* Customer OTP Flow */}
      {loginMethod === 'customer' && (
        <>
          {!otpSent ? (
            <form className="auth-form" onSubmit={handleSendOTP}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" style={{ position: 'absolute', left: '12px', top: '15px', color: '#aaa' }} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="Enter your customer email"
                    className={errors.email ? 'error' : ''}
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP Verification Code'}
                <FaArrowRight />
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerifyOTP}>
              <div className="form-group">
                <label htmlFor="otp">Enter Verification Code</label>
                <div className="input-wrapper">
                  <FaKey className="input-icon" style={{ position: 'absolute', left: '12px', top: '15px', color: '#aaa' }} />
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otpToken}
                    onChange={(e) => {
                      setOtpToken(e.target.value);
                      if (errors.otpToken) setErrors(prev => ({ ...prev, otpToken: '' }));
                    }}
                    placeholder="Enter 6-digit OTP code"
                    maxLength={6}
                    className={errors.otpToken ? 'error' : ''}
                    style={{ paddingLeft: '36px', letterSpacing: '2px', fontWeight: 'bold' }}
                  />
                </div>
                {errors.otpToken && <span className="error-message">{errors.otpToken}</span>}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="auth-button secondary-btn"
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    backgroundColor: '#edf2f7',
                    color: '#4a5568',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    gap: '6px',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <FaRedo size={12} /> Resend
                </button>
                <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                  style={{ flex: 2 }}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Staff Password Flow */}
      {loginMethod === 'staff' && (
        <form className="auth-form" onSubmit={handlePasswordLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" style={{ position: 'absolute', left: '12px', top: '15px', color: '#aaa' }} />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="Enter staff email"
                className={errors.email ? 'error' : ''}
                style={{ paddingLeft: '36px' }}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FaKey className="input-icon" style={{ position: 'absolute', left: '12px', top: '15px', color: '#aaa' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                placeholder="Enter password"
                className={errors.password ? 'error' : ''}
                style={{ paddingLeft: '36px', paddingRight: '40px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In as Staff'}
          </button>
        </form>
      )}

      <div className="auth-footer">
        <p>
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
};
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsSuccess(true);
      setIsLoading(false);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <>
        <div className="auth-header">
          <div className="success-icon">✓</div>
          <h1>Check Your Email</h1>
          <p>We've sent a password reset link to your email address.</p>
        </div>

        <div className="auth-footer">
          <button
            className="auth-button secondary"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
          <p>
            Didn't receive the email?{' '}
            <button
              className="link-button"
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
            >
              Resend
            </button>
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <button
        className="back-button"
        onClick={() => navigate('/login')}
      >
        <FaArrowLeft />
        Back to Login
      </button>

      <div className="auth-header">
        <h1>Forgot Password?</h1>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={error ? 'error' : ''}
            />
          </div>
          {error && <span className="error-message">{error}</span>}
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Remember your password?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
};

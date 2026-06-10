import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'manager', // Default to manager
  });
  
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?\d{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.phone,
      formData.role
    );
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Staff account created successfully! You can now log in.');
      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'manager'
      });
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2500);
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
      background: 'radial-gradient(circle at 10% 20%, rgba(98, 114, 244, 0.9) 0%, rgba(147, 73, 247, 0.9) 90%)',
      padding: '40px 20px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Outfit", "Inter", system-ui, sans-serif'
    }}>
      {/* Decorative floating blurred blobs for glassmorphism depth */}
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
        maxWidth: '560px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        <div className="auth-header" style={{ marginBottom: '28px', textAlign: 'center' }}>
          <span className="brand-logo-animated" style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>🍽️</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Create Staff Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Register a new Manager or Admin account
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

        {successMessage && (
          <div className="success-banner" style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #dcfce7',
            color: '#16a34a',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✅</span> {successMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Row 1: Full Name & Phone Number */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="name" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Full Name</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <FaUser className="input-icon" style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={errors.name ? 'error' : ''}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 38px',
                    border: errors.name ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              {errors.name && <span className="error-message" style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Phone Number</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <FaPhone className="input-icon" style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className={errors.phone ? 'error' : ''}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 38px',
                    border: errors.phone ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              {errors.phone && <span className="error-message" style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.phone}</span>}
            </div>
          </div>

          {/* Row 2: Email Address */}
          <div className="form-group">
            <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Email Address</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <FaEnvelope className="input-icon" style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
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
              />
            </div>
            {errors.email && <span className="error-message" style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.email}</span>}
          </div>

          {/* Row 3: Account Role (Premium Clickable Cards) */}
          <div className="form-group">
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Account Role</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'manager' }))}
                style={{
                  flex: 1,
                  padding: '14px 10px',
                  borderRadius: '14px',
                  border: formData.role === 'manager' ? '2.5px solid #6366f1' : '1.5px solid #cbd5e1',
                  backgroundColor: formData.role === 'manager' ? 'rgba(99, 102, 241, 0.06)' : '#ffffff',
                  color: formData.role === 'manager' ? '#4f46e5' : '#64748b',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: formData.role === 'manager' ? '0 8px 16px rgba(99, 102, 241, 0.12)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>💼</span>
                Restaurant Manager
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                style={{
                  flex: 1,
                  padding: '14px 10px',
                  borderRadius: '14px',
                  border: formData.role === 'admin' ? '2.5px solid #6366f1' : '1.5px solid #cbd5e1',
                  backgroundColor: formData.role === 'admin' ? 'rgba(99, 102, 241, 0.06)' : '#ffffff',
                  color: formData.role === 'admin' ? '#4f46e5' : '#64748b',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: formData.role === 'admin' ? '0 8px 16px rgba(99, 102, 241, 0.12)' : 'none'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>👑</span>
                Administrator
              </button>
            </div>
          </div>

          {/* Row 4: Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Password</label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaLock className="input-icon" style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
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

            <div className="form-group">
              <label htmlFor="confirmPassword" style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Confirm Password</label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaLock className="input-icon" style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={errors.confirmPassword ? 'error' : ''}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 38px',
                    border: errors.confirmPassword ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#ffffff'
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message" style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <button
            type="submit"
            className="auth-button-premium"
            disabled={isLoading}
            style={{ marginTop: '10px' }}
          >
            {isLoading ? 'Registering Account...' : 'Register Staff Account'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Already have a staff account?{' '}
            <Link to="/login" className="auth-link" style={{ color: '#4f46e5', fontWeight: 'bold', textDecoration: 'none' }}>
              Sign in
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

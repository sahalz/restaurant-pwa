import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addressesAPI } from '../../services/api';
import '../../layouts/AuthLayout.css';


export const CompleteProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();

  // Form states
  const [name, setName] = useState(user?.name === 'Customer User' || user?.name === 'User' ? '' : user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredFood, setPreferredFood] = useState('both'); // 'veg' | 'non-veg' | 'both'
  
  // Address states
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');

  // Status states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setErrors({});

    // Client side validations
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone Number is required';
    if (!/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!streetAddress.trim()) newErrors.address = 'Street Address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!stateName.trim()) newErrors.state = 'State is required';
    if (!pincode.trim()) newErrors.pincode = 'Pincode/ZIP code is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Update user profile (name, phone, preferred_food)
      const profileResult = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        preferred_food: preferredFood
      });

      if (!profileResult.success) {
        setServerError(profileResult.error);
        setIsLoading(false);
        return;
      }

      // 2. Save delivery address (address, city, state, pincode, landmark)
      const addressResult = await addressesAPI.saveAddress({
        address: streetAddress.trim(),
        city: city.trim(),
        state: stateName.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim()
      });

      if (addressResult.data?.status !== 'success') {
        setServerError('Profile updated but failed to save delivery address.');
      }

      // Successfully saved both! State in AuthContext updates, which routes the user into the main app.
    } catch (err) {
      console.error('Onboarding submission error:', err);
      setServerError(err.response?.data?.error || 'Failed to complete profile onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
          maxWidth: '600px',
          animation: 'slideUp 0.4s ease-out forwards'
        }}>
        
        <div className="auth-header">
          <span className="onboard-badge">🚀 Onboarding</span>
          <h1>Complete Profile</h1>
          <p style={{ marginTop: '4px' }}>Please complete your profile to access our delivery menu</p>
        </div>

        {serverError && <div className="error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* SECTION 1: Personal Details */}
          <div className="form-section">
            <h3>1. Personal Details</h3>
            <div className="onboard-row">
              <div className="form-group flex-2">
                <label htmlFor="onboard-name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="onboard-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={errors.name ? 'error' : ''}
                    required
                  />
                </div>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              <div className="form-group flex-1">
                <label htmlFor="onboard-phone">Phone Number</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="onboard-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className={errors.phone ? 'error' : ''}
                    required
                  />
                </div>
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* SECTION 2: Food Preference */}
          <div className="form-section">
            <h3>2. Food Preference</h3>
            <div className="preference-options">
              <label className={`pref-card ${preferredFood === 'veg' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="preferredFood"
                  value="veg"
                  checked={preferredFood === 'veg'}
                  onChange={() => setPreferredFood('veg')}
                />
                <span className="pref-icon">🟢</span>
                <span className="pref-label">Vegetarian</span>
              </label>

              <label className={`pref-card ${preferredFood === 'non-veg' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="preferredFood"
                  value="non-veg"
                  checked={preferredFood === 'non-veg'}
                  onChange={() => setPreferredFood('non-veg')}
                />
                <span className="pref-icon">🔴</span>
                <span className="pref-label">Non-Vegetarian</span>
              </label>

              <label className={`pref-card ${preferredFood === 'both' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="preferredFood"
                  value="both"
                  checked={preferredFood === 'both'}
                  onChange={() => setPreferredFood('both')}
                />
                <span className="pref-icon">🟢🔴</span>
                <span className="pref-label">Both</span>
              </label>
            </div>
          </div>

          {/* SECTION 3: Delivery Address */}
          <div className="form-section">
            <h3>3. Delivery Address</h3>
            <div className="form-group">
              <label htmlFor="onboard-address">Street Address / House No / Apartment</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="onboard-address"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Flat 402, Pine Street, Sector 5"
                  className={errors.address ? 'error' : ''}
                  required
                />
              </div>
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="onboard-landmark">Landmark</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="onboard-landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Opposite Central Park / Near Subway"
                />
              </div>
            </div>

            <div className="onboard-row">
              <div className="form-group flex-1">
                <label htmlFor="onboard-city">City</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="onboard-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New York"
                    className={errors.city ? 'error' : ''}
                    required
                  />
                </div>
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>
              <div className="form-group flex-1">
                <label htmlFor="onboard-state">State</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="onboard-state"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="NY"
                    className={errors.state ? 'error' : ''}
                    required
                  />
                </div>
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
              <div className="form-group flex-1">
                <label htmlFor="onboard-pincode">Pincode / ZIP</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="onboard-pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="10001"
                    className={errors.pincode ? 'error' : ''}
                    required
                  />
                </div>
                {errors.pincode && <span className="error-message">{errors.pincode}</span>}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="onboard-footer">
            <button type="button" className="onboard-logout-btn" onClick={logout}>
              Cancel & Logout
            </button>
            <button type="submit" className="auth-button onboard-submit-btn" disabled={isLoading}>
              {isLoading ? 'Saving details...' : 'Complete Profile'}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        .onboard-badge {
          background: rgba(99, 102, 241, 0.1);
          color: #4f46e5;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          display: inline-block;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .form-section {
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 16px;
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .form-section:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }
        .form-section h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #374151;
          margin: 0;
        }
        .onboard-row {
          display: flex;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .onboard-row {
            flex-direction: column;
            gap: 12px;
          }
        }
        .flex-2 {
          flex: 2;
        }
        .flex-1 {
          flex: 1;
        }
        .preference-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        @media (max-width: 640px) {
          .preference-options {
            grid-template-columns: 1fr;
          }
        }
        .pref-card {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        .pref-card input[type="radio"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .pref-icon {
          font-size: 1.5rem;
        }
        .pref-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #4b5563;
        }
        .pref-card:hover {
          background: #f1f5f9;
        }
        .pref-card.selected {
          background: rgba(59, 130, 246, 0.05);
          border-color: #3b82f6;
        }
        .pref-card.selected .pref-label {
          color: #3b82f6;
        }
        .onboard-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
        }
        @media (max-width: 640px) {
          .onboard-footer {
            flex-direction: column-reverse;
          }
          .onboard-logout-btn,
          .onboard-submit-btn {
            width: 100%;
          }
        }
        .onboard-submit-btn {
          flex: 2;
        }
        .onboard-logout-btn {
          flex: 1;
          padding: 14px 24px;
          background: transparent;
          color: #4b5563;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .onboard-logout-btn:hover {
          background: #f1f5f9;
          color: #1f2937;
        }
        /* Custom padding-left override for inputs to match the icons removal */
        .auth-container .form-group input {
          padding-left: 14px !important;
        }
      `}</style>
      </div>
    </>
  );
};

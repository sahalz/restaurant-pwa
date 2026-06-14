import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI, addressesAPI, loyaltyAPI } from '../../services/api';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaTrash,
  FaPlus,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaHistory,
  FaHeadset,
  FaChevronRight,
  FaEdit,
  FaGift,
  FaCoins,
  FaAward
} from 'react-icons/fa';
import './ProfilePage.css';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loyalty, setLoyalty] = useState({ points: 0, total_points_earned: 0, transactions: [] });
  const [loyaltySettings, setLoyaltySettings] = useState({ points_per_rupee: 0.1, rupee_per_point: 0.5, min_points_to_redeem: 50 });
  const [loading, setLoading] = useState(true);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    preferred_food: 'both'
  });
  const [editError, setEditError] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [submittingAddress, setSubmittingAddress] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadProfileAndAddresses = async () => {
      try {
        const [profileRes, addressesRes, loyaltyRes, settingsRes] = await Promise.all([
          authAPI.getProfile(),
          addressesAPI.getAddresses(),
          loyaltyAPI.getProfile().catch(err => {
            console.warn('Loyalty profile could not be fetched:', err);
            return { data: { status: 'success', data: { points: 0, total_points_earned: 0, transactions: [] } } };
          }),
          loyaltyAPI.getSettings().catch(err => {
            console.warn('Loyalty settings could not be fetched:', err);
            return { data: { status: 'success', data: { points_per_rupee: 0.1, rupee_per_point: 0.5, min_points_to_redeem: 50 } } };
          })
        ]);

        const p = profileRes.data.data;
        setProfile(p);
        setAddresses(addressesRes.data.data || []);
        if (loyaltyRes?.data?.status === 'success') {
          setLoyalty(loyaltyRes.data.data);
        }
        if (settingsRes?.data?.status === 'success') {
          setLoyaltySettings(settingsRes.data.data);
        }
        setEditForm({
          name: p?.name || user?.name || '',
          phone: p?.phone || user?.phone || '',
          preferred_food: p?.preferred_food || user?.preferred_food || 'both'
        });
      } catch (error) {
        console.error('Failed to load profile details:', error);
        setError('Failed to fetch details. Please try again.');
        // Fallback profile from context
        const fallback = {
          name: user.name,
          role: user.role,
          email: 'N/A',
          phone: 'N/A'
        };
        setProfile(fallback);
        setEditForm({
          name: fallback.name,
          phone: fallback.phone,
          preferred_food: 'both'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndAddresses();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editForm.name.trim()) {
      setEditError('Name is required');
      return;
    }
    if (!editForm.phone.trim()) {
      setEditError('Phone number is required');
      return;
    }
    if (!/^\+?[0-9\s-]{10,15}$/.test(editForm.phone.trim())) {
      setEditError('Please enter a valid phone number');
      return;
    }

    setUpdatingProfile(true);
    try {
      const result = await updateProfile({
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        preferred_food: editForm.preferred_food
      });

      if (result.success) {
        setProfile(prev => ({
          ...prev,
          name: editForm.name.trim(),
          phone: editForm.phone.trim(),
          preferred_food: editForm.preferred_food
        }));
        setIsEditing(false);
      } else {
        setEditError(result.error || 'Failed to update profile details');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setEditError('An unexpected error occurred. Please try again.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.address.trim()) {
      alert('Street address is required');
      return;
    }

    setSubmittingAddress(true);
    try {
      const res = await addressesAPI.saveAddress({
        address: newAddress.address,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        landmark: newAddress.landmark
      });

      setAddresses(prev => [...prev, res.data.data]);
      setNewAddress({
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
      });

      // Update local storage delivery address copy to reflect latest
      localStorage.setItem('saved_delivery_address', JSON.stringify({
        fullName: profile?.name || user?.name || '',
        phone: profile?.phone || '',
        address: newAddress.address,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
        landmark: newAddress.landmark,
        deliveryInstructions: ''
      }));
    } catch (err) {
      console.error('Failed to save address:', err);
      alert('Failed to save address. Please try again.');
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressesAPI.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (err) {
      console.error('Failed to delete address:', err);
      alert('Failed to delete address.');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        <div className="profile-sidebar">
          {/* User Card */}
          <div className="profile-card user-details-card">
            <div className="profile-avatar">
              <FaUser className="avatar-icon" />
            </div>

            {!isEditing ? (
              <>
                <h2>{profile?.name}</h2>
                <span className="role-tag">{profile?.role?.toUpperCase()}</span>

                <div className="profile-info-grid">
                  <div className="info-item">
                    <FaEnvelope className="info-icon" />
                    <div>
                      <span className="info-label">Email Address</span>
                      <span className="info-value">{profile?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaPhone className="info-icon" />
                    <div>
                      <span className="info-label">Phone Number</span>
                      <span className="info-value">{profile?.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FaShieldAlt className="info-icon" />
                    <div>
                      <span className="info-label">Security Role</span>
                      <span className="info-value">{profile?.role}</span>
                    </div>
                  </div>
                  {profile?.preferred_food && (
                    <div className="info-item">
                      <span className="info-icon" style={{ fontSize: '1.25rem' }}>
                        {profile.preferred_food === 'veg' ? '🟢' : profile.preferred_food === 'non-veg' ? '🔴' : '🟢🔴'}
                      </span>
                      <div>
                        <span className="info-label">Food Preference</span>
                        <span className="info-value">
                          {profile.preferred_food === 'veg' ? 'Vegetarian' : profile.preferred_food === 'non-veg' ? 'Non-Vegetarian' : 'Both'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="profile-actions">
                  <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                    <FaEdit /> Edit Profile
                  </button>
                  <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> Log Out
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleEditSubmit} className="edit-profile-form">
                <h3>Edit Profile Details</h3>

                {editError && <div className="edit-error">{editError}</div>}

                <div className="form-group">
                  <label htmlFor="edit-name">Full Name</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    placeholder="1234567890"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Food Preference</label>
                  <div className="pref-selector">
                    <label className={`pref-option-card ${editForm.preferred_food === 'veg' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="preferred_food"
                        value="veg"
                        checked={editForm.preferred_food === 'veg'}
                        onChange={handleEditChange}
                      />
                      <span className="pref-option-icon">🟢</span>
                      <span className="pref-option-text">Veg</span>
                    </label>

                    <label className={`pref-option-card ${editForm.preferred_food === 'non-veg' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="preferred_food"
                        value="non-veg"
                        checked={editForm.preferred_food === 'non-veg'}
                        onChange={handleEditChange}
                      />
                      <span className="pref-option-icon">🔴</span>
                      <span className="pref-option-text">Non-Veg</span>
                    </label>

                    <label className={`pref-option-card ${editForm.preferred_food === 'both' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="preferred_food"
                        value="both"
                        checked={editForm.preferred_food === 'both'}
                        onChange={handleEditChange}
                      />
                      <span className="pref-option-icon">🟢🔴</span>
                      <span className="pref-option-text">Both</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-edit-btn" onClick={() => setIsEditing(false)} disabled={updatingProfile}>
                    Cancel
                  </button>
                  <button type="submit" className="save-profile-btn" disabled={updatingProfile}>
                    {updatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Compact Loyalty Summary Card */}
          <div className="profile-card loyalty-card" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)', border: '1px solid rgba(102, 126, 234, 0.15)', textAlign: 'left', padding: '24px' }}>
            <div className="loyalty-header" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '12px' }}>
              <div className="loyalty-title-area" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaGift className="loyalty-gift-icon" style={{ color: '#ff6b6b' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a202c', margin: 0 }}>My Rewards</h3>
              </div>
              <span className="loyalty-badge" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>Active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '2px 0' }}>
                  <FaCoins style={{ color: '#fbbf24', fontSize: '1.25rem' }} />
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{loyalty.points}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#059669' }}>
                  ₹{(loyalty.points * (loyaltySettings?.rupee_per_point || 0.5)).toFixed(0)}
                </p>
              </div>
            </div>

            <a href="/rewards" className="edit-profile-btn" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', fontSize: '0.9rem' }}>
              View My Rewards <FaChevronRight size={10} />
            </a>
          </div>
        </div>

        <div className="profile-main">
          {/* Addresses Section */}
          <div className="profile-card addresses-card">
            <h2><FaMapMarkerAlt /> Saved Addresses</h2>

            {addresses.length === 0 ? (
              <p className="no-addresses">No saved addresses found. Add one below!</p>
            ) : (
              <div className="saved-addresses-list">
                {addresses.map(addr => (
                  <div key={addr.id} className="address-item">
                    <div className="address-details">
                      <p className="addr-street">{addr.address}</p>
                      {addr.landmark && (
                        <p className="addr-landmark"><strong>Landmark:</strong> {addr.landmark}</p>
                      )}
                      <p className="addr-city-state">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                    <button
                      className="delete-address-btn"
                      onClick={() => handleDeleteAddress(addr.id)}
                      title="Delete Address"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Address Form */}
            <div className="add-address-section">
              <h3>Add New Address</h3>
              <form onSubmit={handleAddAddress} className="add-address-form">
                <div className="form-group">
                  <label htmlFor="addr-street">Street Address *</label>
                  <input
                    type="text"
                    id="addr-street"
                    name="address"
                    value={newAddress.address}
                    onChange={handleAddressChange}
                    placeholder="123 Main St, Apt 4B"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="addr-landmark">Landmark (Optional)</label>
                  <input
                    type="text"
                    id="addr-landmark"
                    name="landmark"
                    value={newAddress.landmark}
                    onChange={handleAddressChange}
                    placeholder="e.g. Near Subway, Opp Central Park"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="addr-city">City</label>
                    <input
                      type="text"
                      id="addr-city"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      placeholder="New York"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="addr-state">State</label>
                    <input
                      type="text"
                      id="addr-state"
                      name="state"
                      value={newAddress.state}
                      onChange={handleAddressChange}
                      placeholder="NY"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="addr-pincode">PIN Code</label>
                    <input
                      type="text"
                      id="addr-pincode"
                      name="pincode"
                      value={newAddress.pincode}
                      onChange={handleAddressChange}
                      placeholder="10001"
                    />
                  </div>
                </div>
                <button type="submit" className="save-address-btn" disabled={submittingAddress}>
                  {submittingAddress ? 'Saving...' : <><FaPlus /> Add Address</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="profile-card quick-links-card">
          <h2>Quick Links</h2>
          <div className="quick-links-list">
            <a href="/orders" className="quick-link-item">
              <div className="quick-link-icon" style={{ background: 'rgba(102,126,234,0.1)', color: '#667eea' }}>
                <FaHistory />
              </div>
              <span className="quick-link-label">My Orders</span>
              <FaChevronRight className="quick-link-arrow" />
            </a>
            <a href="/support" className="quick-link-item">
              <div className="quick-link-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                <FaHeadset />
              </div>
              <span className="quick-link-label">Support Center</span>
              <FaChevronRight className="quick-link-arrow" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

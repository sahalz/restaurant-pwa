import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI, addressesAPI } from '../../services/api';
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
  FaEdit
} from 'react-icons/fa';
import './ProfilePage.css';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
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
        const [profileRes, addressesRes] = await Promise.all([
          authAPI.getProfile(),
          addressesAPI.getAddresses()
        ]);
        
        const p = profileRes.data.data;
        setProfile(p);
        setAddresses(addressesRes.data.data || []);
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

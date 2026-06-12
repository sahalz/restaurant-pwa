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
  FaChevronRight
} from 'react-icons/fa';
import './ProfilePage.css';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New address form state
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
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
        
        setProfile(profileRes.data.data);
        setAddresses(addressesRes.data.data || []);
      } catch (error) {
        console.error('Failed to load profile details:', error);
        setError('Failed to fetch details. Please try again.');
        // Fallback profile from context
        setProfile({
          name: user.name,
          role: user.role,
          email: 'N/A',
          phone: 'N/A'
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
        pincode: newAddress.pincode
      });
      
      setAddresses(prev => [...prev, res.data.data]);
      setNewAddress({
        address: '',
        city: '',
        state: '',
        pincode: ''
      });
      
      // Update local storage delivery address copy to reflect latest
      localStorage.setItem('saved_delivery_address', JSON.stringify({
        fullName: profile?.name || user?.name || '',
        phone: profile?.phone || '',
        address: newAddress.address,
        city: newAddress.city,
        state: newAddress.state,
        pincode: newAddress.pincode,
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
          <h2>{profile?.name}</h2>
          <span className="role-tag">{profile?.role.toUpperCase()}</span>
          
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
          </div>
          
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Log Out
          </button>
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
                <label>Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={newAddress.address}
                  onChange={handleAddressChange}
                  placeholder="123 Main St, Apt 4B"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    placeholder="New York"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                    placeholder="NY"
                  />
                </div>
                <div className="form-group">
                  <label>PIN Code</label>
                  <input
                    type="text"
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

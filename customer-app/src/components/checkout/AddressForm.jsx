import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export const AddressForm = ({ onSubmit }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('saved_delivery_address');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading saved address:', error);
    }
    return {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      deliveryInstructions: '',
    };
  });

  // Pre-populate fullName if user is logged in and fullName is currently empty
  useEffect(() => {
    if (user?.name && !formData.fullName) {
      setFormData(prev => {
        const updated = { ...prev, fullName: user.name };
        localStorage.setItem('saved_delivery_address', JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem('saved_delivery_address', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      <h2>Delivery Address</h2>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="123-456-7890"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address">Street Address *</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="123 Main St"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="landmark">Landmark (Optional)</label>
        <input
          type="text"
          id="landmark"
          name="landmark"
          value={formData.landmark || ''}
          onChange={handleChange}
          placeholder="e.g. Near Subway, Opp Central Park"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="New York"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">State *</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="NY"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="pincode">PIN Code *</label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder="12345"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</label>
        <textarea
          id="deliveryInstructions"
          name="deliveryInstructions"
          value={formData.deliveryInstructions}
          onChange={handleChange}
          placeholder="Ring doorbell, leave at door, etc."
          rows={3}
        />
      </div>
    </form>
  );
};

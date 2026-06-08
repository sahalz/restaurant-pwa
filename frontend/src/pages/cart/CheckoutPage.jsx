import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddressForm, PaymentMethod, CheckoutSummary } from '../../components/checkout';
import { useCart } from '../../context/CartContext';
import { addressesAPI, orderAPI, paymentAPI } from '../../services/api';
import './CheckoutPage.css';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Fetch saved addresses from backend on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await addressesAPI.getAddresses();
        const savedAddresses = res.data.data || [];
        setAddresses(savedAddresses);
        if (savedAddresses.length > 0) {
          setSelectedAddressId(savedAddresses[0].id);
        } else {
          setSelectedAddressId('new');
        }
      } catch (error) {
        console.error('Failed to load saved addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleAddressSubmit = (addressData) => {
    console.log('Address submitted:', addressData);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setIsPlacingOrder(true);

    try {
      let finalAddressId = null;

      if (selectedAddressId === 'new') {
        const saved = localStorage.getItem('saved_delivery_address');
        let addressData = null;
        if (saved) {
          try {
            addressData = JSON.parse(saved);
          } catch (e) {}
        }

        if (
          !addressData ||
          !addressData.fullName.trim() ||
          !addressData.phone.trim() ||
          !addressData.address.trim() ||
          !addressData.city.trim() ||
          !addressData.state.trim() ||
          !addressData.pincode.trim()
        ) {
          alert('Please complete the delivery address form before placing your order.');
          setIsPlacingOrder(false);
          return;
        }

        // Save new address to backend
        const addrRes = await addressesAPI.saveAddress({
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
        });
        
        finalAddressId = addrRes.data.data.id;
        // Optionally update local addresses state
        setAddresses(prev => [...prev, addrRes.data.data]);
      } else {
        finalAddressId = selectedAddressId;
      }

      if (!finalAddressId) {
        alert('Invalid address selection.');
        setIsPlacingOrder(false);
        return;
      }

      // 1. Create the order in the backend database
      const orderRes = await orderAPI.createOrder({
        address_id: finalAddressId
      });

      const orderId = orderRes.data.data.order_id;

      // 2. Process payment (if Card or PayPal selected)
      if (selectedPayment === 'card' || selectedPayment === 'paypal') {
        await paymentAPI.processPayment({
          order_id: orderId,
          payment_method: selectedPayment,
          transaction_id: `txn_${Math.random().toString(36).substring(2, 11)}`
        });
      }

      // Compute order total for confirmation page
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Success - clear local cart and navigate to confirmation
      clearCart();
      navigate('/order-confirmation', {
        state: { orderId, total, paymentMethod: selectedPayment }
      });
    } catch (error) {
      console.error('Checkout failed:', error);
      alert(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="empty-cart">
            <span className="empty-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Add some items to checkout</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>
 
        <div className="checkout-content">
          <div className="checkout-forms">
            
            {/* Address Selection / Creation Section */}
            <div className="address-section">
              <h2>Delivery Address</h2>
              {loadingAddresses ? (
                <p>Loading saved addresses...</p>
              ) : (
                <div className="address-cards">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      <div className="address-info">
                        <p className="address-text">{addr.address}</p>
                        <p className="address-sub">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                      <div className="address-radio">
                        <div className={`radio-circle ${selectedAddressId === addr.id ? 'active' : ''}`}>
                          {selectedAddressId === addr.id && <div className="radio-dot" />}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div
                    className={`address-card ${selectedAddressId === 'new' ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressId('new')}
                  >
                    <div className="address-info">
                      <p className="address-text"><strong>+ Add New Address</strong></p>
                      <p className="address-sub">Enter a new delivery address details below</p>
                    </div>
                    <div className="address-radio">
                      <div className={`radio-circle ${selectedAddressId === 'new' ? 'active' : ''}`}>
                        {selectedAddressId === 'new' && <div className="radio-dot" />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedAddressId === 'new' && (
              <AddressForm onSubmit={handleAddressSubmit} />
            )}

            <PaymentMethod 
              selectedMethod={selectedPayment}
              onSelect={setSelectedPayment}
            />
          </div>
 
          <div className="checkout-sidebar">
            <CheckoutSummary />
            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { FaCreditCard, FaPaypal, FaMoneyBillWave } from 'react-icons/fa';

export const PaymentMethod = ({ selectedMethod, onSelect }) => {
  const paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: <FaCreditCard />, description: 'Visa, Mastercard, Amex' },
    { id: 'paypal', name: 'PayPal', icon: <FaPaypal />, description: 'Pay with your PayPal account' },
    { id: 'cash', name: 'Cash on Delivery', icon: <FaMoneyBillWave />, description: 'Pay when order arrives' },
  ];

  return (
    <div className="payment-method-section">
      <h2>Payment Method</h2>
      <div className="payment-methods">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
            onClick={() => onSelect(method.id)}
          >
            <div className="payment-icon">{method.icon}</div>
            <div className="payment-info">
              <h3>{method.name}</h3>
              <p>{method.description}</p>
            </div>
            <div className="payment-radio">
              <div className={`radio-circle ${selectedMethod === method.id ? 'active' : ''}`}>
                {selectedMethod === method.id && <div className="radio-dot" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

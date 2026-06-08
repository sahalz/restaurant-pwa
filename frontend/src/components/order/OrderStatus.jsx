import { FaCheckCircle, FaClock, FaUtensils, FaTimesCircle, FaCheck } from 'react-icons/fa';
import { getStatusColor, getStatusLabel } from '../../data/orderData';

export const OrderStatus = ({ status, estimatedDelivery, actualDelivery }) => {
  const statusColor = getStatusColor(status);
  const statusLabel = getStatusLabel(status);

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock />,
      preparing: <FaUtensils />,
      delivered: <FaCheckCircle />,
      cancelled: <FaTimesCircle />,
    };
    return icons[status] || <FaClock />;
  };

  const steps = [
    { key: 'pending', label: 'Pending' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getCurrentStepIndex = () => {
    if (status === 'cancelled') return -1;
    if (status === 'pending') return 0;
    if (status === 'preparing') return 1;
    if (status === 'delivered') return 2;
    return 0;
  };

  const currentStep = getCurrentStepIndex();

  if (status === 'cancelled') {
    return (
      <div className="order-status cancelled">
        <div className="status-icon" style={{ color: statusColor }}>
          {getStatusIcon(status)}
        </div>
        <h3>Order Cancelled</h3>
        <p>This order has been cancelled.</p>
      </div>
    );
  }

  return (
    <div className="order-status">
      <div className="status-header">
        <div className="status-icon" style={{ color: statusColor }}>
          {getStatusIcon(status)}
        </div>
        <div className="status-info">
          <h3>{statusLabel}</h3>
          {estimatedDelivery && !actualDelivery && (
            <p>Estimated delivery: {estimatedDelivery}</p>
          )}
          {actualDelivery && (
            <p>Delivered in: {actualDelivery}</p>
          )}
        </div>
      </div>

      <div className="status-progress">
        {steps.map((step, index) => (
          <div key={step.key} className="progress-step">
            <div
              className={`step-circle ${
                index <= currentStep ? 'active' : ''
              }`}
              style={{
                backgroundColor: index <= currentStep ? statusColor : '#e5e7eb',
              }}
            >
              {index < currentStep ? <FaCheck /> : index + 1}
            </div>
            <span className="step-label">{step.label}</span>
            {index < steps.length - 1 && (
              <div
                className={`step-line ${
                  index < currentStep ? 'active' : ''
                }`}
                style={{
                  backgroundColor: index < currentStep ? statusColor : '#e5e7eb',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

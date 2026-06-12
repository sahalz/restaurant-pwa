// Order status utility helpers

export const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    preparing: '#3b82f6',
    ready: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };
  return colors[status] || '#6b7280';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
};

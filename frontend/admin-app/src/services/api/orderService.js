// Order API service
export const orderService = {
  createOrder: async (orderData) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    return response.json();
  },

  getOrders: async (userId) => {
    const response = await fetch(`/api/orders/user/${userId}`);
    return response.json();
  },

  getOrderById: async (orderId) => {
    const response = await fetch(`/api/orders/${orderId}`);
    return response.json();
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return response.json();
  }
};

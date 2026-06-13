// API Service Layer for Backend Integration
// Base URL: https://api.restaurantpwa.com/v1

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.restaurantpwa.com/v1';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ====================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  sendOTP: (data) => api.post('/auth/otp/send', data),
  verifyOTP: (data) => api.post('/auth/otp/verify', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// ==================== MENU MANAGEMENT ====================

export const menuAPI = {
  getMenu: (categoryId) => {
    const params = categoryId && categoryId !== 'All' ? { category_id: categoryId } : {};
    return api.get('/menu', { params });
  },
  getCategories: () => api.get('/categories'),
};

// ==================== CART MANAGEMENT ====================

export const cartAPI = {
  getCart: () => api.get('/cart'),
  updateCartItem: (menuItemId, quantity) => api.post('/cart/items', { menu_item_id: menuItemId, quantity }),
};

// ==================== ORDERS ====================

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  updateOrderStatus: (orderId, status) => api.patch(`/orders/${orderId}`, { status }),
  cancelOrder: (orderId) => api.patch(`/orders/${orderId}/cancel`),
};

// ==================== PAYMENTS ====================

export const paymentAPI = {
  processPayment: (data) => api.post('/payments/process', data),
  getPaymentStatus: (paymentId) => api.get(`/payments/${paymentId}`),
};

// ==================== DELIVERY TRACKING ====================

export const deliveryAPI = {
  getDeliveryStatus: (orderId) => api.get(`/delivery/order/${orderId}`),
};

// ==================== COMPLAINTS & SUPPORT ====================

export const supportAPI = {
  fileComplaint: (data) => api.post('/complaints', data),
  getComplaints: () => api.get('/complaints'),
  updateComplaintStatus: (id, status) => api.patch(`/complaints/${id}`, { status }),
  requestRefund: (data) => api.post('/refunds', data),
  getRefundRequests: () => api.get('/refunds'),
  updateRefundStatus: (id, status) => api.patch(`/refunds/${id}`, { status }),
  createSupportTicket: (data) => api.post('/support', data),
  getSupportTickets: () => api.get('/support'),
  updateSupportTicketStatus: (id, status) => api.patch(`/support/${id}`, { status }),
};

export const addressesAPI = {
  getAddresses: () => api.get('/addresses'),
  saveAddress: (data) => api.post('/addresses', data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
};

export const loyaltyAPI = {
  getProfile: () => api.get('/loyalty/profile'),
  getSettings: () => api.get('/loyalty/settings'),
  updateSettings: (data) => api.put('/loyalty/settings', data),
};

export default api;

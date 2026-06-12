// User API service
export const userService = {
  getProfile: async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },

  updateProfile: async (userId, userData) => {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  getAddresses: async (userId) => {
    const response = await fetch(`/api/users/${userId}/addresses`);
    return response.json();
  }
};

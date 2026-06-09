// Authentication API service
export const authService = {
  login: async (credentials) => {
    // API call to login
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  register: async (userData) => {
    // API call to register
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  logout: async () => {
    // API call to logout
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    });
    return response.json();
  }
};

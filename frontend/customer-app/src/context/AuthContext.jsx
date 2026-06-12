import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  /**
   * Password login for Restaurant Managers and Administrators
   */
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  /**
   * Password registration for Restaurant Managers and Administrators
   */
  const register = async (name, email, password, phone, role = 'manager') => {
    try {
      const response = await authAPI.register({ 
        name, 
        email, 
        password, 
        phone, 
        role 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  /**
   * Request an Email OTP code (Customers)
   */
  const sendOTP = async (email, name = '', phone = '') => {
    try {
      const response = await authAPI.sendOTP({ email, name, phone });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send OTP'
      };
    }
  };

  /**
   * Verify Email OTP code and sign in (Customers)
   */
  const verifyOTP = async (email, token) => {
    try {
      const response = await authAPI.verifyOTP({ email, token });
      const { token: jwtToken, user: userData } = response.data;

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Invalid or expired OTP code'
      };
    }
  };

  const logout = () => {
    // Clear localStorage and state
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Update authenticated customer profile details
   */
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const { data: updatedUser } = response.data;

      // Merge updated fields into the existing local user state
      const mergedUser = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setUser(mergedUser);
      return { success: true, data: mergedUser };
    } catch (error) {
      console.error('Update profile context error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update profile details'
      };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading,
        login, 
        register,
        sendOTP,
        verifyOTP,
        updateProfile,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

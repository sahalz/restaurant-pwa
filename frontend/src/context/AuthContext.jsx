// Authentication context for user management - Aligned with backend API
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

  const login = async (email, password) => {
    // TODO: Integrate with backend API when ready
    // try {
    //   const response = await authAPI.login({ email, password });
    //   const { token, user: userData } = response.data;
    //   
    //   localStorage.setItem('token', token);
    //   localStorage.setItem('user', JSON.stringify(userData));
    //   
    //   setUser(userData);
    //   setIsAuthenticated(true);
    //   return { success: true };
    // } catch (error) {
    //   console.error('Login error:', error);
    //   return { 
    //     success: false, 
    //     error: error.response?.data?.message || 'Login failed' 
    //   };
    // }
    
    // Temporary mock login for frontend testing
    const mockUser = { id: '1', name: 'Test User', email };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const register = async (name, email, password, phone, role = 'customer') => {
    // TODO: Integrate with backend API when ready
    // try {
    //   const response = await authAPI.register({ 
    //     name, 
    //     email, 
    //     password, 
    //     phone, 
    //     role 
    //   });
    //   return { success: true, data: response.data };
    // } catch (error) {
    //   console.error('Registration error:', error);
    //   return { 
    //     success: false, 
    //     error: error.response?.data?.message || 'Registration failed' 
    //   };
    // }
    
    // Temporary mock registration for frontend testing
    const mockUser = { id: '1', name, email, phone, role };
    return { success: true, data: mockUser };
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    
    // TODO: Call backend API when ready
    // authAPI.logout();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading,
        login, 
        register,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

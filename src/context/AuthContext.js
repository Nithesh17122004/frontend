import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Generate or retrieve user ID based on email
  const getUserId = (email) => {
    // Create a hash from email for consistent user ID
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = ((hash << 5) - hash) + email.charCodeAt(i);
      hash = hash & hash;
    }
    return 'user_' + Math.abs(hash).toString(16);
  };

  useEffect(() => {
    // Check for stored user data
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('driveclone_current_user');
        const token = localStorage.getItem('driveclone_token');
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('driveclone_current_user');
        localStorage.removeItem('driveclone_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Generate consistent user ID from email
      const userId = getUserId(email);
      
      const mockUser = {
        id: userId,
        email: email,
        firstName: email.split('@')[0],
        lastName: 'User',
        storageUsed: 0,
        storageLimit: 1073741824 // 1GB
      };
      
      // Store user data
      localStorage.setItem('driveclone_token', 'mock_token_' + userId);
      localStorage.setItem('driveclone_current_user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error('Login failed');
      return { success: false };
    }
  };

  const register = async (userData) => {
    try {
      // Generate consistent user ID from email
      const userId = getUserId(userData.email);
      
      const mockUser = {
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        storageUsed: 0,
        storageLimit: 1073741824 // 1GB
      };
      
      // Store user data
      localStorage.setItem('driveclone_token', 'mock_token_' + userId);
      localStorage.setItem('driveclone_current_user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      toast.error('Registration failed');
      return { success: false };
    }
  };

  const logout = () => {
    // Don't clear user data from localStorage on logout
    // Only clear auth tokens
    localStorage.removeItem('driveclone_token');
    localStorage.removeItem('driveclone_current_user');
    
    setUser(null);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would send an email
      console.log(`Password reset email would be sent to: ${email}`);
      
      toast.success('Password reset instructions sent to your email');
      return { success: true };
      
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Failed to send reset email');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Password would be reset with token: ${token}`);
      
      toast.success('Password reset successful! You can now login with your new password');
      return { success: true };
      
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to reset password');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const activateAccount = async (token) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Account would be activated with token: ${token}`);
      
      toast.success('Account activated successfully!');
      return { success: true };
      
    } catch (error) {
      console.error('Activation error:', error);
      toast.error('Activation failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = () => {
    return user;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    activateAccount,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
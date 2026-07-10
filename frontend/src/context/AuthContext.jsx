import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Failed to load user profile:', error.message);
          // Token is expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data.data;
      
      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      setLoading(false);
      return receivedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signup = async (fullName, email, phoneNumber, password, confirmPassword) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', {
        fullName,
        email,
        phoneNumber,
        password,
        confirmPassword
      });
      const { token: receivedToken, user: receivedUser } = response.data.data;

      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      setLoading(false);
      return receivedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Failed to refresh profile:', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

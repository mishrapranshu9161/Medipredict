import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medipredict_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth session from token
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Session restore failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await authAPI.login(credentials);
      if (res.success && res.data.token) {
        localStorage.setItem('medipredict_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setLoading(false);
        return { success: true, role: res.data.user.role };
      }
      setLoading(false);
      return { success: false, message: res.message || 'Login failed' };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (patientData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(patientData);
      if (res.success && res.data.token) {
        localStorage.setItem('medipredict_token', res.data.token);
        setToken(res.data.token);
        // Refresh full me profile
        const meRes = await authAPI.getMe();
        if (meRes.success) {
          setUser(meRes.data);
        }
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, message: res.message || 'Registration failed' };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('medipredict_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await authAPI.getMe();
        if (res.success) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Refresh user failed:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
        refreshUser,
        isAuthenticated: !!user
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

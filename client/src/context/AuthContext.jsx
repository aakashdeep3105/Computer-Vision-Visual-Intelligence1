import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('visioninsight_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('visioninsight_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Validate token with backend /auth/me on initial load
  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('visioninsight_token');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('visioninsight_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.warn('Initial session validation failed or token expired:', err.message);
        localStorage.removeItem('visioninsight_token');
        localStorage.removeItem('visioninsight_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();

    // Listen for session expiration events
    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      localStorage.setItem('visioninsight_token', receivedToken);
      localStorage.setItem('visioninsight_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return response.data;
    }
    throw new Error(response.data.message || 'Login failed');
  };

  const register = async (email, password) => {
    const response = await authAPI.register({ email, password });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      localStorage.setItem('visioninsight_token', receivedToken);
      localStorage.setItem('visioninsight_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return response.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('visioninsight_token');
    localStorage.removeItem('visioninsight_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


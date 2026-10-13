import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/index.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'dhatu_auth_token';
const USER_KEY = 'dhatu_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(true);

  // Re-verify token with backend on mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getMe();
        if (isMounted) {
          const userData = response.data?.user || response.data;
          setUser(userData);
          setToken(savedToken);
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
        }
      } catch {
        // Token expired or invalid
        if (isMounted) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signup = async ({ name, email, password }) => {
    const response = await authApi.signup({ name, email, password });
    const payload = response.data;
    const newUser = payload.user;
    const newToken = payload.token;

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return payload;
  };

  const login = async ({ email, password }) => {
    const response = await authApi.login({ email, password });
    const payload = response.data;
    const loggedUser = payload.user;
    const newToken = payload.token;

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
    setToken(newToken);
    setUser(loggedUser);

    return payload;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
      setToken(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    signup,
    login,
    logout,
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

export default AuthContext;

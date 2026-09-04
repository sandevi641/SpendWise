import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; currency?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('spendwise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('spendwise_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('spendwise_user', JSON.stringify(profile));
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await authService.login({ email, password: pass });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('spendwise_token', data.token);
    localStorage.setItem('spendwise_user', JSON.stringify(data.user));
  };

  const register = async (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    currency?: string;
  }) => {
    const data = await authService.register(formData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('spendwise_token', data.token);
    localStorage.setItem('spendwise_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('spendwise_user', JSON.stringify(updatedUser));
  };

  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      updateUser(profile);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

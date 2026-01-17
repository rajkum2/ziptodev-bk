import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/apiClient';

interface Admin {
  id: string;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('admin');

    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }

    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response: any = await apiClient.post('/admin/auth/login', {
        username,
        password
      });

      if (response.success && response.data) {
        const { admin, token } = response.data;
        setAdmin(admin);
        setToken(token);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('admin', JSON.stringify(admin));
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
  };

  const hasPermission = (permission: string): boolean => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    if (admin.permissions.includes('*')) return true;
    return admin.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ admin, token, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


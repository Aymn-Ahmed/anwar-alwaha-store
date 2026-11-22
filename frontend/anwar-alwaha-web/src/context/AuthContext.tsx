import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser, AuthResponse } from '../types/admin.types';
import { adminApi } from '../api/adminApi';
import { setAccessToken, getAccessToken } from '../api/client';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('anwar_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [accessTokenState, setAccessTokenState] = useState<string | null>(getAccessToken());
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const handleAuthSuccess = (res: AuthResponse) => {
    const adminUser: AdminUser = {
      fullName: res.fullName,
      email: res.email,
      role: res.role,
    };
    setUser(adminUser);
    setAccessTokenState(res.accessToken);
    setAccessToken(res.accessToken);
    localStorage.setItem('anwar_admin_user', JSON.stringify(adminUser));
  };

  const logout = useCallback(async () => {
    try {
      await adminApi.auth.logout();
    } catch {}
    setUser(null);
    setAccessTokenState(null);
    setAccessToken(null);
    localStorage.removeItem('anwar_admin_user');
    showToast('تم تسجيل الخروج بنجاح', 'info');
  }, [showToast]);

  // Try silent session restoration via RefreshToken cookie on initial load
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const existingToken = getAccessToken();
      const existingUser = localStorage.getItem('anwar_admin_user');

      // If we already have a stored 24h access token and user, keep session alive immediately
      if (existingToken && existingUser) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await adminApi.auth.refresh();
        if (isMounted) {
          handleAuthSuccess(res);
        }
      } catch (e) {
        if (isMounted) {
          setUser(null);
          setAccessTokenState(null);
          setAccessToken(null);
          localStorage.removeItem('anwar_admin_user');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    const handleExpired = () => {
      logout();
    };

    window.addEventListener('anwar_admin_auth_expired', handleExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('anwar_admin_auth_expired', handleExpired);
    };
  }, [logout]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await adminApi.auth.login({ email, password: pass });
      handleAuthSuccess(res);
      showToast(`مرحباً بك يا ${res.fullName}! تم تسجيل الدخول بنجاح`, 'success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessTokenState,
        isAuthenticated: !!user && !!accessTokenState,
        loading,
        login,
        logout,
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

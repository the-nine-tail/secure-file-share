'use client'

import React, { createContext, useContext, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setUser, clearUser, setLoading } from '../store/slices/authSlice'
import { authService } from '../services/authService'

interface AuthContextType {
  login: (tokens: { access_token: string; refresh_token: string }) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const router = useRouter();
  const authCheckRef = useRef(false);

  const checkAuth = useCallback(async () => {
    // Skip if we're already loading or have checked auth
    console.log('isLoading:', isLoading);
    if (isLoading || authCheckRef.current) {
      return isAuthenticated;
    }

    try {
      dispatch(setLoading(true));
      const userData = await authService.getCurrentUser();
      dispatch(setUser(userData));
      authCheckRef.current = true;
      return true;
    } catch (error) {
      try {
        await authService.refreshToken();
        const userData = await authService.getCurrentUser();
        dispatch(setUser(userData));
        authCheckRef.current = true;
        return true;
      } catch (refreshError) {
        dispatch(clearUser());
        return false;
      }
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, isAuthenticated, isLoading]);

  const login = async (tokens: { access_token: string; refresh_token: string }) => {
    try {
      dispatch(setLoading(true));
      const userData = await authService.getCurrentUser();
      dispatch(setUser(userData));
      authCheckRef.current = true;
    } catch (error) {
      console.error('Error setting user after login:', error);
      dispatch(clearUser());
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(clearUser());
      authCheckRef.current = false;
      router.push('/authentication/login');
    }
  };

  useEffect(() => {
    // Only check auth once on mount if not authenticated
    if (!isAuthenticated && !authCheckRef.current) {
      checkAuth();
    }
  }, []); // Empty dependency array for mount only

  return (
    <AuthContext.Provider value={{ login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

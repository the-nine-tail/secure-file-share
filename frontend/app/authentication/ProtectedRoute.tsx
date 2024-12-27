'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../store/hooks';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const { checkAuth } = useAuth();
  const router = useRouter();
  const authCheckAttempted = useRef(false);

  useEffect(() => {
    const verifyAuth = async () => {
      // Only check if not authenticated and haven't attempted yet
      if (!isAuthenticated && !authCheckAttempted.current) {
        authCheckAttempted.current = true;
        const isAuthed = await checkAuth();
        if (!isAuthed) {
          router.push('/authentication/login');
        }
      }
    };

    verifyAuth();
  }, [checkAuth, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
} 
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../store/hooks';

export default function AuthenticationPage() {
  const { isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/authentication/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  return null
}

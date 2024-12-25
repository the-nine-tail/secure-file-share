'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '~/app/context/AuthContext'

export default function AuthenticationPage() {
  const { isAuthenticated, isLoading } = useAuth()
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

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '~/app/context/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isLoading) {
        const isAuthed = await checkAuth()
        if (!isAuthed) {
          router.push('/authentication/login')
        }
      }
    }
    verifyAuth()
  }, [isLoading, checkAuth, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return isAuthenticated ? <>{children}</> : null
} 
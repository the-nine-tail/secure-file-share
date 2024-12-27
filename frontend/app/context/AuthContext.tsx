'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeProvider } from 'styled-components'
import { Theme } from '../theme'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (tokens: { access_token: string; refresh_token: string }) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8000/get-user', {
        method: 'GET',
        credentials: 'include',
      })

      console.log(response);
      
      if (response.ok) {
        setIsAuthenticated(true)
        return true
      } 
      
      // If not authenticated, try refresh token
      const refreshResponse = await fetch('http://localhost:8000/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        setIsAuthenticated(true)
        return true
      }
      
      setIsAuthenticated(false)
      return false
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      return false
    }
  }

  const login = async (tokens: { access_token: string; refresh_token: string }) => {
    setIsAuthenticated(true)
    await checkAuth() // Verify the auth state after login
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setIsAuthenticated(false)
      router.push('/authentication/login')
    }
  }

  useEffect(() => {
    checkAuth().finally(() => setIsLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, checkAuth }}>
      <ThemeProvider theme={Theme}>{children}</ThemeProvider>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
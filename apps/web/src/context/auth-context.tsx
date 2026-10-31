'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ApiClient, DEMO_ACCOUNTS, Organization, User, UserRole } from '@labshare/shared'

interface AuthContextType {
  user: User | null
  role: UserRole
  org: Organization | null
  token: string | null
  client: ApiClient
  isAuthenticated: boolean
  isLoading: boolean
  loginWithOtp: (phone: string, otp: string) => Promise<void>
  switchRole: (role: UserRole) => Promise<void>
  logout: () => void
}

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') return `${window.location.origin}/api/v1`
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  return '/api/v1'
}

const defaultClient = new ApiClient('/api/v1')

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'TEACHER_SPONSOR',
  org: null,
  token: null,
  client: defaultClient,
  isAuthenticated: false,
  isLoading: true,
  loginWithOtp: async () => {},
  switchRole: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState<ApiClient>(() => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : getApiBaseUrl()
    return new ApiClient(url)
  })
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole>('TEACHER_SPONSOR')
  const [org, setOrg] = useState<Organization | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      client.setBaseUrl(`${window.location.origin}/api/v1`)
    }

    // Check local storage or initialize with default Teacher Sponsor demo account
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('labshare_token')
        const savedRole = localStorage.getItem('labshare_role') as UserRole

        if (savedToken) {
          client.setToken(savedToken)
          setToken(savedToken)
          try {
            const me = await client.auth.getMe()
            setUser(me.user)
            if (me.activeMembership) {
              setRole(me.activeMembership.role)
              setOrg(me.activeMembership.organization)
            }
            setIsLoading(false)
            return
          } catch {
            // fallback to demo switch
          }
        }

        // Auto-bootstrap as Teacher Sponsor demo user for seamless evaluation
        const targetRole: UserRole = savedRole || 'TEACHER_SPONSOR'
        const res = await client.auth.switchDemoRole(targetRole)
        client.setToken(res.accessToken)
        setToken(res.accessToken)
        setUser(res.user)
        setRole(res.activeRole)
        localStorage.setItem('labshare_token', res.accessToken)
        localStorage.setItem('labshare_role', res.activeRole)
      } catch (err) {
        console.warn('Auth auto-bootstrap deferred (running offline or API starting up):', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [client])

  const loginWithOtp = async (phone: string, otp: string) => {
    setIsLoading(true)
    try {
      const res = await client.auth.verifyOtp(phone, otp)
      client.setToken(res.accessToken)
      setToken(res.accessToken)
      setUser(res.user)
      if (res.memberships && res.memberships[0]) {
        setRole(res.memberships[0].role)
        setOrg(res.memberships[0].organization)
        localStorage.setItem('labshare_role', res.memberships[0].role)
      }
      localStorage.setItem('labshare_token', res.accessToken)
    } finally {
      setIsLoading(false)
    }
  }

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true)
    try {
      const res = await client.auth.switchDemoRole(newRole)
      client.setToken(res.accessToken)
      setToken(res.accessToken)
      setUser(res.user)
      setRole(res.activeRole)
      localStorage.setItem('labshare_token', res.accessToken)
      localStorage.setItem('labshare_role', res.activeRole)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    client.setToken(null)
    setToken(null)
    setUser(null)
    localStorage.removeItem('labshare_token')
    localStorage.removeItem('labshare_role')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        org,
        token,
        client,
        isAuthenticated: !!user,
        isLoading,
        loginWithOtp,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

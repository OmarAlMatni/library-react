import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as authApi from '../api/auth'
import { getToken, setToken, onUnauthorized } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [librarian, setLibrarian] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearSession = useCallback(() => {
    setToken(null)
    setLibrarian(null)
  }, [])

  useEffect(() => {
    // On first load, if we have a stored token, confirm it's still valid
    // and fetch the current librarian's profile.
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((data) => setLibrarian(data))
      .catch(() => clearSession())
      .finally(() => setLoading(false))
  }, [clearSession])

  useEffect(() => onUnauthorized(clearSession), [clearSession])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    setToken(data.token)
    setLibrarian(data.librarian)
    return data
  }, [])

  const loginAsDemo = useCallback(() => {
    // Bypass the backend entirely: plant a local demo session so the UI
    // can be explored without a running API or valid credentials.
    setToken('demo-token')
    setLibrarian({
      id: 'demo',
      name: 'Demo Librarian',
      email: 'demo@school.edu',
    })
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if the request fails (e.g. token already expired), clear locally.
    }
    clearSession()
  }, [clearSession])

  return (
    <AuthContext.Provider
      value={{ librarian, loading, isAuthenticated: !!librarian, login, logout, loginAsDemo }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

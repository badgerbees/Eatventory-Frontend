import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, isConfigured } from '../firebase'
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth'

const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [idToken, setIdToken] = useState(() => typeof localStorage !== 'undefined' ? (localStorage.getItem('idToken') || null) : null)
  const [configured, setConfigured] = useState(isConfigured)

  useEffect(() => {
    setConfigured(isConfigured)
    if (!isConfigured || !auth) return
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        try {
          const token = await u.getIdToken()
          setIdToken(token)
          if (typeof localStorage !== 'undefined') localStorage.setItem('idToken', token)
        } catch (e) {
          console.error('Failed to get id token', e)
        }
      } else {
        setUser(null)
        setIdToken(null)
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('idToken')
        }
      }
    })
    return () => unsub()
  }, [])

  const signOut = async () => {
    await fbSignOut(auth)
    setUser(null)
    setIdToken(null)
    if (typeof localStorage !== 'undefined') localStorage.removeItem('idToken')
  }

  const value = { user, idToken, signOut }
  // expose isConfigured so consumers can react
  value.isConfigured = configured
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

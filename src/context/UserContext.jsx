import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import * as authService from '../api/authService'

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined'

const UserContext = createContext()

export function UserProvider({ children }) {
  const auth = useAuth()

  const [localUser, setLocalUser] = useState(() => {
    if (USE_API) return null
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  // Sync localStorage in demo mode
  useEffect(() => {
    if (USE_API) return
    if (localUser) {
      localStorage.setItem('user', JSON.stringify(localUser))
    } else {
      localStorage.removeItem('user')
    }
  }, [localUser])

  const user = USE_API ? auth.userAuth : localUser
  const isAuthenticated = USE_API ? !!auth.userAuth : !!localUser

  // login: in API mode takes (email, password), in demo mode takes (userData object)
  const login = USE_API
    ? async (emailOrData, password) => {
        const email = typeof emailOrData === 'string' ? emailOrData : emailOrData.email
        const pwd = password || (typeof emailOrData === 'object' ? emailOrData.password : '')
        return auth.loginUser(email, pwd)
      }
    : (userData) => {
        setLocalUser(userData)
      }

  const logout = USE_API
    ? async () => auth.logoutUser()
    : () => {
        setLocalUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('cart')
        localStorage.removeItem('favorites')
      }

  const updateProfile = USE_API
    ? async (updates) => {
        // Optimistic local update; server sync can be added later
        const updated = { ...auth.userAuth, ...updates }
        localStorage.setItem('user', JSON.stringify(updated))
        return updated
      }
    : (updates) => {
        setLocalUser(prev => ({ ...prev, ...updates }))
      }

  const updateProfileImage = USE_API
    ? async (imageUrl) => {
        const updated = { ...auth.userAuth, profileImage: imageUrl }
        localStorage.setItem('user', JSON.stringify(updated))
        return updated
      }
    : (imageUrl) => {
        setLocalUser(prev => ({ ...prev, profileImage: imageUrl }))
      }

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        updateProfileImage
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}

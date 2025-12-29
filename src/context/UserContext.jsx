import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('user')
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
      setIsAuthenticated(true)
    } else {
      localStorage.removeItem('user')
      setIsAuthenticated(false)
    }
  }, [user])

  const login = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
    localStorage.removeItem('favorites')
  }

  const updateProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }

  const updateProfileImage = (imageUrl) => {
    setUser(prev => ({ ...prev, profileImage: imageUrl }))
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

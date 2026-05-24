import { createContext, useContext, useEffect, useState } from 'react'
import { getCsrfToken } from '../utils/csrf.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('marketplace_user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const syncSession = async () => {
      try {
        const response = await fetch('/api/me/', {
          credentials: 'include',
        })

        if (!response.ok) {
          setUser(null)
          localStorage.removeItem('marketplace_user')
          return
        }

        const data = await response.json()
        setUser(data)
        localStorage.setItem('marketplace_user', JSON.stringify(data))
      } catch {
        setUser(null)
        localStorage.removeItem('marketplace_user')
      } finally {
        setIsLoading(false)
      }
    }

    syncSession()
  }, [])

  const signIn = (nextUser) => {
    setUser(nextUser)
    localStorage.setItem('marketplace_user', JSON.stringify(nextUser))
  }

  const signOut = async () => {
    try {
      const csrfToken = await getCsrfToken()

      await fetch('/api/logout/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      })
    } finally {
      setUser(null)
      localStorage.removeItem('marketplace_user')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
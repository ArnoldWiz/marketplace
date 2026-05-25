import { useEffect, useState } from 'react'
import { AuthContext } from './authContext.js'
import { fetchCurrentUser, logoutUser } from '../api/marketplaceApi.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('marketplace_user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const syncSession = async () => {
      try {
        const data = await fetchCurrentUser()
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
      await logoutUser()
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

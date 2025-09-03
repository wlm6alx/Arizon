import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  username: string | null
  emailVerified: Date | null
  isActive: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  firstName: string
  lastName: string
  username?: string
}

export interface AuthError {
  message: string
  code?: string
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('auth_user')
        
        if (token && userStr) {
          const user = JSON.parse(userStr) as User
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setError(null)
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle structured error format from backend
        if (data.error && data.error.message) {
          throw new Error(data.error.message)
        } else if (data.error) {
          throw new Error(data.error)
        } else {
          throw new Error('Échec de la connexion')
        }
      }

      const { user, token } = data.data

      // Store in localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite'
      setError({ message: errorMessage })
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setError(null)
      setAuthState(prev => ({ ...prev, isLoading: true }))

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle structured error format from backend
        if (data.error && data.error.message) {
          throw new Error(data.error.message)
        } else if (data.error) {
          throw new Error(data.error)
        } else {
          throw new Error('Échec de l\'inscription')
        }
      }

      const { user, token } = data.data

      // Store in localStorage
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(user))

      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite'
      setError({ message: errorMessage })
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear localStorage and state
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      })
      
      setError(null)
      router.push('/login')
    }
  }, [router])

  const requestPasswordReset = useCallback(async (email: string): Promise<boolean> => {
    try {
      setError(null)
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle structured error format from backend
        if (data.error && data.error.message) {
          throw new Error(data.error.message)
        } else if (data.error) {
          throw new Error(data.error)
        } else {
          throw new Error('Échec de la demande de réinitialisation')
        }
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite'
      setError({ message: errorMessage })
      return false
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    ...authState,
    error,
    login,
    register,
    logout,
    requestPasswordReset,
    clearError,
  }
}

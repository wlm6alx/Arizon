import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

export interface UserProfile {
  id: string
  email: string
  username: string | null
  firstName: string | null
  lastName: string | null
  avatar: string | null
  phone: string | null
  bio: string | null
  address: string | null
  city: string | null
  country: string | null
  timezone: string | null
  emailVerified: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
  userRoles?: {
    id: string
    assignedAt: Date
    expiresAt: Date | null
    role: {
      id: string
      name: string
      type: string
      description: string | null
      color: string | null
    }
  }[]
}

export interface UserProfileState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

export function useUserProfile() {
  const [state, setState] = useState<UserProfileState>({
    user: null,
    loading: true,
    error: null
  })

  const fetchProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await api.get('/users/profile')
      
      if (response.data?.data?.user) {
        setState({
          user: response.data.data.user,
          loading: false,
          error: null
        })
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile'
      setState({
        user: null,
        loading: false,
        error: errorMessage
      })
    }
  }, [])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await api.put('/users/profile', updates)
      
      if (response.data?.data?.user) {
        setState(prev => ({
          ...prev,
          user: response.data.data.user,
          loading: false,
          error: null
        }))
        return true
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user profile'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      return false
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    ...state,
    fetchProfile,
    updateProfile,
    clearError
  }
}

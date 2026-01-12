import { supabase } from '@/integrations/supabase/client'

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  name: string;
  phone?: string;
  userType?: string;
}

export const authApi = {
  async login(data: LoginData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw new Error(error.message)
      }

      return {
        _id: authData.user?.id,
        name: authData.user?.user_metadata?.name || authData.user?.email,
        email: authData.user?.email,
        phone: authData.user?.user_metadata?.phone,
        userType: authData.user?.user_metadata?.userType,
        token: authData.session?.access_token,
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to authentication service.')
      }
      throw error
    }
  },

  async register(data: RegisterData) {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            userType: data.userType,
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!authData.user) {
        throw new Error('Registration failed')
      }

      return {
        _id: authData.user.id,
        name: data.name,
        email: authData.user.email,
        phone: data.phone,
        userType: data.userType,
        token: authData.session?.access_token,
      }
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to authentication service.')
      }
      throw error
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },
}

// Export individual functions for convenience
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return {
    user: data.user,
    session: data.session,
    error: error?.message,
  }
}

// OAuth Sign In
export const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/signin`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    }
  })

  return {
    data,
    error: error?.message,
  }
}

// Get current session
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  return {
    session,
    user: session?.user,
    error: error?.message,
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

export const register = async (email: string, password: string, name: string, phone?: string, userType?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        userType,
      }
    }
  })

  return {
    user: data.user,
    session: data.session,
    error: error?.message,
  }
}

// Reset password - sends email with reset link (MySQL backend)
export const resetPassword = async (email: string) => {
  try {
    const response = await fetch('http://localhost:5001/api/users/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { data: null, error: data.error || 'Failed to send reset email' }
    }

    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message || 'Network error' }
  }
}

// Update password - called after user clicks reset link (MySQL backend)
export const updatePassword = async (token: string, newPassword: string) => {
  try {
    const response = await fetch('http://localhost:5001/api/users/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { user: null, error: data.error || 'Failed to reset password' }
    }

    return { user: data, error: null }
  } catch (error: any) {
    return { user: null, error: error.message || 'Network error' }
  }
}
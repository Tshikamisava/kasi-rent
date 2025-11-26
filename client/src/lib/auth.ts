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
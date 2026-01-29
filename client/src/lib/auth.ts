// MySQL-based authentication (no Supabase)
const API_URL = 'http://localhost:5001/api/auth';

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
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      return result.user;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to authentication service.');
      }
      throw error;
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          role: data.userType || 'tenant',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      return result.user;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to authentication service.');
      }
      throw error;
    }
  },

  async logout() {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
      });
    } catch (error) {
      // Logout is mainly client-side for JWT
      console.error('Logout error:', error);
    }
  },
};

// Export individual functions for convenience
export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        user: null,
        session: null,
        error: result.error || 'Invalid login credentials',
      };
    }

    // Format response to match Supabase structure
    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        user_metadata: {
          name: result.user.name,
          phone: result.user.phone,
          userType: result.user.role,
        },
      },
      session: {
        access_token: result.token,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : 'Login failed',
    };
  }
};

// OAuth Sign In (disabled for MySQL-only auth)
export const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook') => {
  return {
    data: null,
    error: 'OAuth is not available with MySQL authentication',
  };
};

// Get current session (MySQL version)
export const getCurrentSession = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { session: null, user: null, error: null };
    }

    const response = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { session: null, user: null, error: 'Session expired' };
    }

    const result = await response.json();
    
    return {
      session: { access_token: token },
      user: {
        id: result.user.id,
        email: result.user.email,
        user_metadata: {
          name: result.user.name,
          phone: result.user.phone,
          userType: result.user.role,
        },
      },
      error: null,
    };
  } catch (error) {
    return {
      session: null,
      user: null,
      error: error instanceof Error ? error.message : 'Failed to get session',
    };
  }
};

// Listen to auth state changes (no-op for MySQL)
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  // For MySQL auth, we don't have real-time auth state changes
  return { data: { subscription: { unsubscribe: () => {} } } };
};

export const register = async (email: string, password: string, name: string, phone?: string, userType?: string) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        phone,
        role: userType || 'tenant',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        user: null,
        session: null,
        error: result.error || 'Registration failed',
      };
    }

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        user_metadata: {
          name: result.user.name,
          phone: result.user.phone,
          userType: result.user.role,
        },
      },
      session: {
        access_token: result.token,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
};

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
const API_URL = 'http://localhost:5000/api';

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
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to server. Please make sure the server is running on port 5000.');
      }
      throw error;
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to server. Please make sure the server is running on port 5000.');
      }
      throw error;
    }
  },
};
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  userType?: string;
  role?: string;
  profile_photo?: string;
}

interface AuthState {
  user: User | null;
  userType: string | null;
  setUser: (user: User | null) => void;
  setUserType: (userType: string | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      userType: null,
      isAuthenticated: false,
      loading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setUser: (user) => {
        try {
          if (user && (user as any).token) {
            localStorage.setItem('token', (user as any).token);
          } else {
            localStorage.removeItem('token');
          }
        } catch (e) {
          console.warn('Unable to persist token to localStorage', e);
        }

        set({ user, isAuthenticated: !!user });
      },
      setUserType: (userType) => set({ userType }),
      logout: () => {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (e) {
          console.warn('Unable to clear token from localStorage', e);
        }

        set({ user: null, userType: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
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
      setUserType: (userType) => set({ userType }),
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, userType: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
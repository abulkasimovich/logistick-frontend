import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  login: (user: AuthUser, token: string, refreshToken: string) => void;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      login: (user, token, refreshToken) => set({ user, token, refreshToken }),
      logout: () => set({ user: null, token: null, refreshToken: null }),
      hasRole: (...roles) => roles.includes(get().user?.role ?? ''),
    }),
    { name: 'fleet-auth' },
  ),
);

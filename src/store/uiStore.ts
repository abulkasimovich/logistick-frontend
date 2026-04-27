import { create } from 'zustand';
import type { Period } from '../types';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'error' | 'info';
  at: Date;
}

interface UiState {
  sidebarCollapsed: boolean;
  period: Period;
  notifications: Notification[];
  toggleSidebar: () => void;
  setPeriod: (p: Period) => void;
  addNotification: (n: Omit<Notification, 'id' | 'at'>) => void;
  clearNotifications: () => void;
}

export const useUiStore = create<UiState>()(set => ({
  sidebarCollapsed: false,
  period: '12M',
  notifications: [],
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setPeriod: period => set({ period }),
  addNotification: n =>
    set(s => ({
      notifications: [
        { ...n, id: Math.random().toString(36).slice(2), at: new Date() },
        ...s.notifications.slice(0, 19),
      ],
    })),
  clearNotifications: () => set({ notifications: [] }),
}));

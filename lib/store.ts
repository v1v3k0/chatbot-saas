import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types/supabase'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

interface NotificationState {
  notifications: Array<{
    id: string
    title: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    read: boolean
    createdAt: string
  }>
  unreadCount: number
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id' | 'read' | 'createdAt'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  setUnreadCount: (count: number) => void
}

interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

interface LoanState {
  selectedLoanId: string | null
  setSelectedLoanId: (id: string | null) => void
}

// Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Notification Store
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },
  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },
  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id)
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification?.read ? state.unreadCount : Math.max(0, state.unreadCount - 1),
      }
    })
  },
  setUnreadCount: (count) => set({ unreadCount: count }),
}))

// UI Store
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
    }
  )
)

// Loan Store
export const useLoanStore = create<LoanState>((set) => ({
  selectedLoanId: null,
  setSelectedLoanId: (id) => set({ selectedLoanId: id }),
}))

// Combined store for easy access
export const useStore = () => ({
  auth: useAuthStore(),
  notifications: useNotificationStore(),
  ui: useUIStore(),
  loan: useLoanStore(),
})
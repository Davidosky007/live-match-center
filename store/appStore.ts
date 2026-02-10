import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppTheme, User } from '@/lib/types';
import { generateUserId } from '@/lib/utils';

// Connection state slice
interface ConnectionState {
  status: 'connected' | 'reconnecting' | 'disconnected';
  reconnectAttempt: number;
  lastConnectedAt: Date | null;
  setConnectionStatus: (
    status: 'connected' | 'reconnecting' | 'disconnected',
    attempt?: number
  ) => void;
  setLastConnectedAt: (date: Date) => void;
}

// Theme state slice
interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

// User state slice
interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

// Combined store
type AppStore = ConnectionState & ThemeState & UserState;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Connection state
      status: 'disconnected',
      reconnectAttempt: 0,
      lastConnectedAt: null,
      setConnectionStatus: (status, attempt = 0) =>
        set({ status, reconnectAttempt: attempt }),
      setLastConnectedAt: (date) => set({ lastConnectedAt: date }),

      // Theme state
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (typeof window !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // User state
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'matchcenter_app',
      partialize: (state) => ({
        theme: state.theme,
        user: state.user,
      }),
    }
  )
);

// Initialize user from localStorage or create new
export function initializeUser(): User {
  const store = useAppStore.getState();

  if (store.user) {
    return store.user;
  }

  const newUser: User = {
    userId: generateUserId(),
    username: '',
  };

  store.setUser(newUser);
  return newUser;
}

// Apply theme on app initialization
export function initializeTheme(): void {
  const store = useAppStore.getState();
  const theme = store.theme;

  if (typeof window !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

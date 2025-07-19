import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  theme: 'light' | 'dark' | 'system';
  isLoading: boolean;
  selectedPlayer: string | null;
  selectedTab: string;
  sidebarOpen: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedPlayer: (playerId: string | null) => void;
  setSelectedTab: (tab: string) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      isLoading: false,
      selectedPlayer: null,
      selectedTab: 'dashboard',
      sidebarOpen: false,
      
      setTheme: (theme) => set({ theme }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setSelectedPlayer: (playerId) => set({ selectedPlayer: playerId }),
      setSelectedTab: (tab) => set({ selectedTab: tab }),
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'ui-store',
      version: 1,
    }
  )
); 
import { create } from 'zustand';
import { Home } from '../types/home';
import { getHome } from '../api/home';

interface HomeState {
  home: Home | null;
  isLoading: boolean;
  error: string | undefined;
  fetchHome: () => Promise<void>;
  reset: () => void;
}

export const useHomeStore = create<HomeState>((set) => ({
  home: null,
  isLoading: false,
  error: undefined,
  fetchHome: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const home = await getHome();
      set({ home, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to load home data', isLoading: false });
    }
  },
  reset: () => set({ home: null, isLoading: false, error: undefined }),
}));

import { create } from 'zustand';
import { Visit, CreateVisit } from '../types/visits';
import { CreateActivitySnapshot } from '../types/activities';
import { getVisits, createVisit as apiCreateVisit, deleteVisit as apiDeleteVisit } from '../api/visits';

interface VisitsState {
  visits: Visit[];
  isLoading: boolean;
  error: string | undefined;
  fetchVisits: () => Promise<void>;
  addVisit: (visit: CreateVisit, schedule?: CreateActivitySnapshot[]) => Promise<Visit>;
  removeVisit: (id: number) => Promise<void>;
  reset: () => void;
}

export const useVisitsStore = create<VisitsState>((set, get) => ({
  visits: [],
  isLoading: false,
  error: undefined,
  fetchVisits: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const visits = await getVisits();
      set({ visits, isLoading: false });
    } catch {
      set({ error: 'Failed to load visits', isLoading: false });
    }
  },
  addVisit: async (visit, schedule = []) => {
    const newVisit = await apiCreateVisit(visit, schedule);
    set((state) => ({ visits: [...state.visits, newVisit] }));
    return newVisit;
  },
  removeVisit: async (id) => {
    await apiDeleteVisit(id);
    set((state) => ({ visits: state.visits.filter((v) => v.id !== id) }));
  },
  reset: () => set({ visits: [], isLoading: false, error: undefined }),
}));

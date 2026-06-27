import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  isLoading: true,
  setFirebaseUser: (user) => set({ firebaseUser: user }),
  setLoading: (loading) => set({ isLoading: loading }),
  signOut: async () => {
    await firebaseAuth.signOut();
    set({ firebaseUser: null });
  },
}));

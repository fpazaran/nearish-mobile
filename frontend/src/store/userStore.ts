import { create } from 'zustand';
import { Couple, Invite, User } from '../types/user';

interface UserState {
  uid: string | undefined;
  name: string;
  couple: Couple | undefined;
  inviteCode: Invite | undefined;
  isLoading: boolean;
  error: string | undefined;
  setUser: (user: User) => void;
  setCouple: (couple: Couple) => void;
  setInviteCode: (code: Invite) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  reset: () => void;
}

const initialState = {
  uid: undefined,
  name: '',
  couple: undefined,
  inviteCode: undefined,
  isLoading: true,
  error: undefined,
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,
  setUser: (user) =>
    set({ uid: user.uid, name: user.name, couple: user.couple }),
  setCouple: (couple) => set({ couple }),
  setInviteCode: (code) => set({ inviteCode: code }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));

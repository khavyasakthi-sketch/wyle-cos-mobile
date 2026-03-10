import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Obligation, InsightsData, MorningBrief } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AppState {
  // Auth
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;

  // Obligations
  obligations: Obligation[];
  setObligations: (obs: Obligation[]) => void;
  updateObligation: (id: string, updates: Partial<Obligation>) => void;

  // Insights
  insights: InsightsData | null;
  setInsights: (data: InsightsData) => void;

  // Brief
  morningBrief: MorningBrief | null;
  setMorningBrief: (brief: MorningBrief) => void;

  // UI
  isLoading: boolean;
  setLoading: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  obligations: [],
  insights: null,
  morningBrief: null,
  isLoading: false,

  setAuth: async (token, user) => {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER]);
    set({ token: null, user: null, isAuthenticated: false, obligations: [], insights: null, morningBrief: null });
  },

  updateUser: (user) => set({ user }),

  setObligations: (obligations) => set({ obligations }),

  updateObligation: (id, updates) => {
    const updated = get().obligations.map(o => o._id === id ? { ...o, ...updates } : o);
    set({ obligations: updated });
  },

  setInsights: (insights) => set({ insights }),
  setMorningBrief: (morningBrief) => set({ morningBrief }),
  setLoading: (isLoading) => set({ isLoading }),
}));

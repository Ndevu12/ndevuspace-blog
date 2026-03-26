import { create } from "zustand";
import type { AuthState, User } from "@/types/auth";

interface AuthStoreState extends AuthState {
  isPending: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsPending: (isPending: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isPending: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsPending: (isPending) => set({ isPending }),
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Account } from "@/types";

interface AuthState {
  user: User | null;
  account: Account | null;
  token: string | null;
  setAuth: (user: User, account: Account, token: string) => void;
  setUser: (user: User) => void;
  setAccount: (account: Account) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      account: null,
      token: null,
      setAuth: (user, account, token) => set({ user, account, token }),
      setUser: (user) => set({ user }),
      setAccount: (account) => set({ account }),
      clearAuth: () => set({ user: null, account: null, token: null }),
    }),
    {
      name: "clientsphere-auth",
    }
  )
);

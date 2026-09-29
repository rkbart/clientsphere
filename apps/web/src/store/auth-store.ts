import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Account } from "@/types";

interface AuthState {
  user: User | null;
  account: Account | null;
  token: string | null;
  setAuth: (user: User, account: Account, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      account: null,
      token: null,
      setAuth: (user, account, token) => set({ user, account, token }),
      clearAuth: () => set({ user: null, account: null, token: null }),
    }),
    {
      name: "clientsphere-auth",
    }
  )
);

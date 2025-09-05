import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  teams: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  selectedTeam: string | undefined;
  tokenExpiry: number | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  setSelectedTeam: (team: string | undefined) => void;
  getSelectedTeam: () => string | undefined;
  logout: () => void;
  isTokenValid: () => boolean;
  checkTokenExpiry: () => boolean;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      selectedTeam: undefined,
      tokenExpiry: null,
      setTokens: (accessToken, refreshToken) => {
        if (accessToken) {
          const decoded = JSON.parse(atob(accessToken.split(".")[1]));
          set({
            accessToken,
            refreshToken,
            tokenExpiry: decoded.exp * 1000,
          });
        } else {
          set({
            accessToken: null,
            refreshToken: null,
            tokenExpiry: null,
          });
        }
      },
      setUser: (user) => set({ user }),
      setSelectedTeam: (team) => set({ selectedTeam: team }),
      getSelectedTeam: () => get().selectedTeam,
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          selectedTeam: undefined,
          tokenExpiry: null,
        }),
      isTokenValid: () => {
        const state = get();
        if (!state.accessToken || !state.tokenExpiry) return false;
        return Date.now() < state.tokenExpiry;
      },
      checkTokenExpiry: () => {
        const state = get();
        if (!state.accessToken || !state.tokenExpiry) return false;

        const isValid = Date.now() < state.tokenExpiry;
        if (!isValid) {
          state.logout();
        }
        return isValid;
      },
      getAccessToken: () => get().accessToken,
      getRefreshToken: () => get().refreshToken,
    }),
    {
      name: "auth-storage",
    },
  ),
);

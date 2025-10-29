import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  teams: string[];
  slack_user_id?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  selectedTeam: string | undefined;
  selectedBoards: Record<string, string>;
  tokenExpiry: number | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  updateUserSlackId: (slackUserId: string) => void;
  setSelectedTeam: (team: string | undefined) => void;
  getSelectedTeam: () => string | undefined;
  setSelectedBoard: (teamName: string, boardId: string) => void;
  getSelectedBoard: (teamName: string) => string | undefined;
  clearSelectedBoards: () => void;
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
      selectedBoards: {},
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
      updateUserSlackId: (slackUserId) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              slack_user_id: slackUserId,
            },
          });
        }
      },
      setSelectedTeam: (team) => set({ selectedTeam: team }),
      getSelectedTeam: () => get().selectedTeam,
      setSelectedBoard: (teamName, boardId) => {
        const currentBoards = get().selectedBoards;
        set({
          selectedBoards: {
            ...currentBoards,
            [teamName]: boardId,
          },
        });
      },
      getSelectedBoard: (teamName) => {
        const currentBoards = get().selectedBoards;
        return currentBoards[teamName];
      },
      clearSelectedBoards: () => set({ selectedBoards: {} }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          selectedTeam: undefined,
          selectedBoards: {},
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

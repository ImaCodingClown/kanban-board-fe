import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  teams: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  selectedTeam: string | undefined;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setSelectedTeam: (team: string | undefined) => void;
  getSelectedTeam: () => string | undefined;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      selectedTeam: undefined,
      setToken: (token) => set({ token }),
      setUser: (user) => {
        if (user) {
          const correctedUser = {
            ...user,
            teams: user.teams.includes("LJY Members") 
              ? user.teams 
              : ["LJY Members"]
          };
          set({ user: correctedUser });
          
          const currentSelectedTeam = get().selectedTeam;
          if (!currentSelectedTeam || !correctedUser.teams.includes(currentSelectedTeam)) {
            set({ selectedTeam: "LJY Members" });
          }
        } else {
          set({ user });
        }
      },
      setSelectedTeam: (team) => set({ selectedTeam: team }),
      getSelectedTeam: () => get().selectedTeam,
    }),
    {
      name: "auth-storage",
    },
  ),
);
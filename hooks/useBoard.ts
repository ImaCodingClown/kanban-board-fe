import { useMutation, useQuery } from "react-query";
import { BoardModel } from "@/models/board";
import { useAuth } from "@/store/authStore";
import { api } from "@/services/api";

export const useBoard = () => {
  const user = useAuth((state) => state.user);
  const selectedTeam = useAuth((state) => state.selectedTeam);

  return useQuery<BoardModel, Error>({
    queryKey: ["board", selectedTeam],
    enabled: Boolean(user && selectedTeam),
    queryFn: async () => {
      if (!user || !selectedTeam) {
        throw new Error("User not authenticated or no team selected");
      }

      const response = await api.get<BoardModel>("/board", {
        params: { team: selectedTeam },
      });
      return response.data;
    },
  });
};

export const useCreateBoard = () => {
  const selectedTeam = useAuth((state) => state.selectedTeam);

  return useMutation({
    mutationKey: ["createBoard", selectedTeam],
    mutationFn: async () => {
      if (!selectedTeam) {
        throw new Error("No team selected");
      }

      const response = await api.post("/board", {
        team: selectedTeam,
      });

      return response.data;
    },
  });
};

export const useUpdateBoard = () => {
  return useMutation({
    mutationKey: ["updateBoard"],
    mutationFn: async (board: BoardModel) => {
      const response = await api.put("/board", {
        board: board,
      });

      return response.data;
    },
  });
};
import { useMutation, useQuery } from "react-query";
import { BoardModel, ColumnModel } from "@/models/board";
import { useAuth } from "@/store/authStore";
import { api } from "@/services/api";

export const useBoard = () => {
  const user = useAuth((state) => state.user);

  return useQuery<BoardModel, Error>({
    queryKey: ["board", user?.teams[0]],
    enabled: Boolean(user?.teams?.length),
    queryFn: async () => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await api.get<BoardModel>("/board", {
        params: { team: user.teams[0] },
      });
      return response.data;
    },
  });
};

export const useCreateBoard = () => {
  const user = useAuth((state) => state.user);

  return useMutation({
    mutationKey: ["createBoard"],
    mutationFn: async () => {
      if (!user || !user.teams?.length) {
        throw new Error("User not authenticated or has no team");
      }

      const response = await api.post("/board", {
        team: user.teams[0],
      });

      return response.data;
    },
  });
};
export const useUpdateBoard = () => {
  const user = useAuth((state) => state.user);

  return useMutation({
    mutationKey: ["updateBoard"],
    mutationFn: async (board: BoardModel) => {
      if (!user || !user.teams?.length) {
        throw new Error("User not authenticated or has no team");
      }

      const response = await api.put("/board", {
        board: board,
      });

      return response.data;
    },
  });
};

import { useMutation, useQuery, useQueryClient } from "react-query";
import { BoardModel } from "@/models/board";
import { useAuth } from "@/store/authStore";
import { boardService, CreateBoardPayload } from "@/services/board";

export const useBoard = (boardId?: string) => {
  const user = useAuth((state) => state.user);
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const getSelectedBoard = useAuth((state) => state.getSelectedBoard);

  return useQuery<BoardModel, Error>({
    queryKey: ["board", boardId || getSelectedBoard(selectedTeam || "")],
    enabled: Boolean(
      user && selectedTeam && (boardId || getSelectedBoard(selectedTeam || "")),
    ),
    queryFn: async () => {
      if (!user || !selectedTeam) {
        throw new Error("User not authenticated or no team selected");
      }

      const targetBoardId = boardId || getSelectedBoard(selectedTeam);
      if (!targetBoardId) {
        throw new Error("No board selected for team");
      }

      return await boardService.getBoard(targetBoardId);
    },
  });
};

export const useBoards = (teamName: string) => {
  const user = useAuth((state) => state.user);

  return useQuery<BoardModel[], Error>({
    queryKey: ["boards", teamName],
    enabled: Boolean(user && teamName),
    queryFn: async () => {
      if (!user || !teamName) {
        throw new Error("User not authenticated or no team provided");
      }

      return await boardService.getBoardsByTeam(teamName);
    },
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();
  const selectedTeam = useAuth((state) => state.selectedTeam);

  return useMutation({
    mutationKey: ["createBoard", selectedTeam],
    mutationFn: async (payload: CreateBoardPayload) => {
      if (!selectedTeam) {
        throw new Error("No team selected");
      }

      return await boardService.createBoard(payload);
    },
    onSuccess: (newBoard) => {
      // Invalidate boards list for the team
      queryClient.invalidateQueries(["boards", selectedTeam]);
      // Add the new board to cache
      queryClient.setQueryData(["board", newBoard._id], newBoard);
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateBoard"],
    mutationFn: async (board: BoardModel) => {
      return await boardService.updateBoard(board);
    },
    onSuccess: (updatedBoard) => {
      // Update board cache
      queryClient.setQueryData(["board", updatedBoard._id], updatedBoard);
      // Invalidate boards list to refresh
      queryClient.invalidateQueries(["boards", updatedBoard.team]);
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteBoard"],
    mutationFn: async (boardId: string) => {
      await boardService.deleteBoard(boardId);
    },
    onSuccess: (_, boardId) => {
      // Remove board from cache
      queryClient.removeQueries(["board", boardId]);
      // Invalidate boards list
      queryClient.invalidateQueries(["boards"]);
    },
  });
};

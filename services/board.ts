import { api } from "./api";
import { BoardModel, BoardsResponse } from "@/models/board";

export interface CreateBoardPayload {
  team: string;
  board_name: string;
}

export const boardService = {
  // Get specific board by ID
  getBoard: async (boardId: string): Promise<BoardModel> => {
    const response = await api.get<BoardModel>("/v1/board", {
      params: { board_id: boardId },
    });
    return response.data;
  },

  // Get all boards for a team
  getBoardsByTeam: async (teamName: string): Promise<BoardModel[]> => {
    const response = await api.get<BoardModel[]>("/v1/boards", {
      params: { team: teamName },
    });
    return response.data;
  },

  // Create a new board
  createBoard: async (payload: CreateBoardPayload): Promise<BoardModel> => {
    const response = await api.post<BoardModel>("/v1/board", payload);
    return response.data;
  },

  // Update board
  updateBoard: async (board: BoardModel): Promise<BoardModel> => {
    const response = await api.put<BoardModel>("/v1/board", { board });
    return response.data;
  },

  // Delete board
  deleteBoard: async (boardId: string): Promise<void> => {
    await api.delete("/v1/board", {
      params: { board_id: boardId },
    });
  },
};

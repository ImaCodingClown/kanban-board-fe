export interface CardModel {
  _id?: string;
  board_id: string;
  title: string;
  description?: string;
  assignee?: string;
  story_point?: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
}

export interface ColumnModel {
  title: string;
  cards: CardModel[];
}

export interface BoardModel {
  _id?: string;
  team: string;
  board_name: string;
  iteration?: string;
  columns: ColumnModel[];
}

export interface BoardResponse {
  board: BoardModel;
}

export interface BoardsResponse {
  boards: BoardModel[];
}

export interface CardModel {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  story_points?: number;
  priority?: string;
}

export interface ColumnModel {
  id: string;
  title: string;
  cards: CardModel[];
}

export type BoardModel = ColumnModel[];

export interface BoardResponse {
  board: BoardModel;
}

// import { ObjectId } from "mongodb";
export interface CardModel {
  _id?: string;
  title: string;
  description?: string;
  assignee?: string;
  story_point?: number;
  priority?: string;
}

export interface ColumnModel {
  title: string;
  cards: CardModel[];
}

export interface BoardModel {
  id?: string;
  team: string;
  iteration: string;
  columns: ColumnModel[];
}

export interface BoardResponse {
  board: BoardModel;
}

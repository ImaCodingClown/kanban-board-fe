export type BoardModel = ColumnModel[];

export interface ColumnModel {
  id: string;
  title: string;
  cards: CardModel[];
}

export interface CardModel {
  id: string;
  title: string;
  assigned_id: string;
}

export interface BoardResponse {
    board: BoardModel
}

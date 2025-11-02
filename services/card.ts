import { api, apiPath } from "./api";

export const addCard = async ({
  title,
  description,
  columnTitle,
  storyPoint,
  assignee,
  boardId,
  priority,
}: {
  title: string;
  description?: string;
  columnTitle: string;
  storyPoint: number;
  assignee: string;
  boardId: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}) => {
  const response = await api.post(apiPath("/card"), {
    title,
    description,
    column_name: columnTitle,
    story_point: storyPoint,
    assignee,
    board_id: boardId,
    priority,
  });

  return response.data;
};

export const getColumns = async (boardId: string) => {
  const response = await api.get(
    `${apiPath("/columns")}?board_id=${encodeURIComponent(boardId)}`,
  );
  return response.data;
};

export const deleteCard = async ({
  cardId,
  columnName,
  boardId,
}: {
  cardId: string;
  columnName: string;
  boardId: string;
}) => {
  const response = await api.post(apiPath("/card/delete"), {
    card_id: cardId,
    column_name: columnName,
    board_id: boardId,
  });
  return response.data;
};

export const editCard = async ({
  cardId,
  title,
  description,
  columnTitle,
  storyPoint,
  assignee,
  boardId,
  priority,
}: {
  cardId: string;
  title: string;
  description: string;
  columnTitle: string;
  storyPoint: number;
  assignee: string;
  boardId: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}) => {
  const response = await api.post(apiPath("/card/edit"), {
    card_id: cardId,
    title,
    description,
    column_name: columnTitle,
    story_point: storyPoint,
    assignee,
    board_id: boardId,
    priority,
  });

  return response.data;
};

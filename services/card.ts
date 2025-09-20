import { api } from "./api";

export const addCard = async ({
  title,
  description,
  columnTitle,
  storyPoint,
  assignee,
  team,
  priority,
}: {
  title: string;
  description?: string;
  columnTitle: string;
  storyPoint: number;
  assignee: string;
  team: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}) => {
  const response = await api.post("/v1/card", {
    title,
    description,
    column_name: columnTitle,
    story_point: storyPoint,
    assignee,
    team,
    priority,
  });

  return response.data;
};

export const getColumns = async (team: string) => {
  const response = await api.get(
    `/v1/columns?team=${encodeURIComponent(team)}`,
  );
  return response.data;
};

export const deleteCard = async ({
  cardId,
  columnName,
  team,
}: {
  cardId: string;
  columnName: string;
  team: string;
}) => {
  const response = await api.post("/v1/card/delete", {
    card_id: cardId,
    column_name: columnName,
    team,
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
  team,
  priority,
}: {
  cardId: string;
  title: string;
  description: string;
  columnTitle: string;
  storyPoint: number;
  assignee: string;
  team: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}) => {
  const response = await api.post("/v1/card/edit", {
    card_id: cardId,
    title,
    description,
    column_name: columnTitle,
    story_point: storyPoint,
    assignee,
    team,
    priority,
  });

  return response.data;
};

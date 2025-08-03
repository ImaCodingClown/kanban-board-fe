import { api } from "./api";
import axios from "axios";

export const addCard = async ({
  title,
  description,
  columnTitle,
  team,
}: {
  title: string;
  description?: string;
  columnTitle: string;
  team: string;
}) => {
  const response = await api.post("/v1/card", {
    title,
    description,
    column_name: columnTitle,
    team: "LJY Members",
  });

  return response.data;
};

export const getColumns = async (team: string) => {
  const response = await api.get(`/v1/columns?team=LJY Members`);
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
  team,
}: {
  cardId: string;
  title: string;
  description: string;
  columnTitle: string;
  team: string;
}) => {
  const response = await api.post("/v1/card/edit", {
    card_id: cardId,
    title,
    description,
    column_name: columnTitle,
    team,
  });

  return response.data;
};

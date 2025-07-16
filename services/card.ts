import { api } from "./api";

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
    team,
  });

  return response.data;
};

export const getColumns = async (team: string) => {
  const response = await api.get(`/v1/columns?team=${team}`);
  return response.data;
};

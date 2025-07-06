import { useQuery } from "react-query";

import { ColumnModel } from "@/models/board";

export const useBoard = () => {
  return useQuery<ColumnModel[], unknown>({
    queryKey: ["board"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8080/board", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team: "default" }),
      });

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Error fetching board: ${txt}`);
      }

      const data: ColumnModel[] = await response.json();
      return data;
    },
  });
};

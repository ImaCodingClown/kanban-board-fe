import { useQuery } from "react-query";
import axios from "axios";
import { ColumnModel } from "@/models/board";

export const useBoard = () => {
  return useQuery<ColumnModel[], unknown>({
    queryKey: ["board"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8080/board");
      return res.data;
    },
  });
};

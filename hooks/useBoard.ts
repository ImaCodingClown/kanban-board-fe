import { useQuery } from "react-query";
import { ColumnModel } from "@/models/board";
import { useAuth } from "@/store/authStore";
import { api } from "@/services/api";

export const useBoard = () => {
  const user = useAuth((state) => state.user);

  return useQuery<ColumnModel[], Error>({
    queryKey: ["board", user?.teams[0]],
    enabled: Boolean(user?.teams?.length),
    queryFn: async () => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const response = await api.get<ColumnModel[]>("/board", {
        params: { team: user.teams[0] },
      });
      return response.data;
    },
  });
};

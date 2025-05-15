import { useQuery, UseQueryResult } from "react-query";
import axios from "axios";
import { BoardResponse } from "@/models/board";


export const useBoard= () : UseQueryResult<BoardResponse, unknown> => {
    return useQuery<BoardResponse, unknown>({
        queryKey: ['board'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:8080/board');
                console.log(res);
                return res.data;
        }
    });
};

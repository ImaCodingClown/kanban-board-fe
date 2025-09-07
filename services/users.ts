import { api } from "./api";

export interface User {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
}

export const usersService = {
  async getAllUsers(): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>("/users");
    return response.data;
  },
};

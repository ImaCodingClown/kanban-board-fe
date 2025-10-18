import { api } from "./api";

export interface User {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  slack_user_id?: string;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
}

export interface UpdateSlackIdPayload {
  slack_user_id: string;
}

export interface UpdateSlackIdResponse {
  success: boolean;
  user: User;
  message: string;
}

export const usersService = {
  async getAllUsers(): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>("/users");
    return response.data;
  },

  async updateSlackUserId(
    userId: string,
    slackUserId: string,
  ): Promise<UpdateSlackIdResponse> {
    const response = await api.patch<UpdateSlackIdResponse>(
      `/v1/user/${userId}/slack`,
      {
        slack_user_id: slackUserId,
      },
    );
    return response.data;
  },
};

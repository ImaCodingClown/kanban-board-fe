import { api } from "./api";
import {
  CreateTeamPayload,
  UpdateTeamPayload,
  AddMemberPayload,
  RemoveMemberPayload,
  TeamResponse,
  TeamsResponse,
} from "@/models/teams";

export const teamsService = {
  async createTeam(payload: CreateTeamPayload): Promise<TeamResponse> {
    const response = await api.post<TeamResponse>("/teams", payload);
    return response.data;
  },

  async getTeam(teamName: string): Promise<TeamResponse> {
    const response = await api.get<TeamResponse>(`/teams/${teamName}`);
    return response.data;
  },

  async getUserTeams(): Promise<TeamsResponse> {
    const response = await api.get<TeamsResponse>("/teams");
    return response.data;
  },

  async updateTeam(
    teamName: string,
    payload: UpdateTeamPayload
  ): Promise<TeamResponse> {
    const response = await api.put<TeamResponse>(`/teams/${teamName}`, payload);
    return response.data;
  },

  async addMember(
    teamName: string,
    payload: AddMemberPayload
  ): Promise<TeamResponse> {
    const response = await api.post<TeamResponse>(
      `/teams/${teamName}/members`,
      payload
    );
    return response.data;
  },

  async removeMember(
    teamName: string,
    payload: RemoveMemberPayload
  ): Promise<TeamResponse> {
    const response = await api.delete<TeamResponse>(
      `/teams/${teamName}/members`,
      { data: payload }
    );
    return response.data;
  },

  async leaveTeam(teamName: string): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>(
      `/teams/${teamName}/leave`
    );
    return response.data;
  },

  async deleteTeam(teamName: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(
      `/teams/${teamName}`
    );
    return response.data;
  },
};

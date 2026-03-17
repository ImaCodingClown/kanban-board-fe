import { api, apiPath } from "./api";
import {
  CreateTeamPayload,
  UpdateTeamPayload,
  AddMemberPayload,
  RemoveMemberPayload,
  TeamResponse,
  TeamsResponse,
  TeamWithUsernamesResponse,
} from "@/models/teams";

export const teamsService = {
  async createTeam(payload: CreateTeamPayload): Promise<TeamResponse> {
    const response = await api.post<TeamResponse>(apiPath("/teams"), payload);
    return response.data;
  },

  async getTeam(teamName: string): Promise<TeamResponse> {
    const response = await api.get<TeamResponse>(apiPath(`/teams/${teamName}`));
    return response.data;
  },

  async getUserTeams(): Promise<TeamsResponse> {
    const response = await api.get<TeamsResponse>(apiPath("/teams"));
    return response.data;
  },

  async updateTeam(
    teamName: string,
    payload: UpdateTeamPayload,
  ): Promise<TeamResponse> {
    const response = await api.put<TeamResponse>(
      apiPath(`/teams/${teamName}`),
      payload,
    );
    return response.data;
  },

  async addMember(
    teamName: string,
    payload: AddMemberPayload,
  ): Promise<TeamResponse> {
    const response = await api.post<TeamResponse>(
      apiPath(`/teams/${teamName}/members`),
      payload,
    );
    return response.data;
  },

  async removeMember(
    teamName: string,
    payload: RemoveMemberPayload,
  ): Promise<TeamResponse> {
    const response = await api.delete<TeamResponse>(
      apiPath(`/teams/${teamName}/members`),
      { data: payload },
    );
    return response.data;
  },

  async leaveTeam(teamName: string): Promise<{ success: boolean }> {
    const response = await api.post<{ success: boolean }>(
      apiPath(`/teams/${teamName}/leave`),
    );
    return response.data;
  },

  async deleteTeam(teamName: string): Promise<{ success: boolean }> {
    const response = await api.delete<{ success: boolean }>(
      apiPath(`/teams/${teamName}`),
    );
    return response.data;
  },

  async getTeamWithUsernames(
    teamName: string,
  ): Promise<TeamWithUsernamesResponse> {
    const response = await api.get<TeamWithUsernamesResponse>(
      apiPath(`/teams/${teamName}/with-usernames`),
    );
    return response.data;
  },
};

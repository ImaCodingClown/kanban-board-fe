export interface TeamMember {
  user_id: string;
  role: TeamRole;
  joined_at: string;
  permissions: string[];
}

export enum TeamRole {
  Leader = "Leader",
  Collaborator = "Collaborator",
}

export interface Team {
  _id?: string;
  name: string;
  description?: string;
  leader_id: string;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  slack_webhook_url?: string;
}

export interface CreateTeamPayload {
  name: string;
  description?: string;
}

export interface UpdateTeamPayload {
  name?: string;
  description?: string;
  slack_webhook_url?: string;
}

export interface AddMemberPayload {
  user_id: string;
  role: TeamRole;
}

export interface RemoveMemberPayload {
  user_id: string;
}

export interface TeamResponse {
  success: boolean;
  team: Team;
}

export interface TeamsResponse {
  success: boolean;
  teams: Team[];
}

// explicitly for API responses, not stored in the db
export interface TeamMemberWithUsername {
  user_id: string;
  username: string;
  role: string;
  joined_at: string;
  permissions: string[];
}

export interface TeamWithUsernames {
  _id?: string;
  name: string;
  description?: string;
  leader_id: string;
  members: TeamMemberWithUsername[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface TeamWithUsernamesResponse {
  success: boolean;
  team: TeamWithUsernames;
}

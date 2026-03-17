import { useCallback, useMemo } from "react";
import { useAuth } from "@/store/authStore";
import { Team, TeamRole } from "@/models/teams";

interface UsePermissionResult {
  isAuthenticated: boolean;
  userTeams: string[];
  canAccessTeam: (teamName: string) => boolean;
  isTeamMember: (teamName: string) => boolean;
  isTeamLeader: (team: Team) => boolean;
  hasTeamPermission: (team: Team, permission: string) => boolean;
  canEditTeam: (team: Team) => boolean;
  canManageTeamMembers: (team: Team) => boolean;
  canDeleteTeam: (team: Team) => boolean;
  getUserRoleInTeam: (team: Team) => TeamRole | null;
}

export const usePermission = (): UsePermissionResult => {
  const user = useAuth((state) => state.user);
  const accessToken = useAuth((state) => state.accessToken);

  const isAuthenticated = useMemo(() => {
    return !!accessToken && !!user;
  }, [accessToken, user]);

  const userTeams = useMemo(() => {
    return user?.teams ?? [];
  }, [user?.teams]);

  const getUserId = useCallback(() => {
    if (!user?.id) return null;
    if (typeof user.id === "object" && (user.id as any)?.$oid) {
      return (user.id as any).$oid;
    }
    return user.id;
  }, [user?.id]);

  const canAccessTeam = useCallback(
    (teamName: string): boolean => {
      if (!isAuthenticated) return false;
      return userTeams.includes(teamName);
    },
    [isAuthenticated, userTeams],
  );

  const isTeamMember = useCallback(
    (teamName: string): boolean => {
      return canAccessTeam(teamName);
    },
    [canAccessTeam],
  );

  const isTeamLeader = useCallback(
    (team: Team): boolean => {
      const userId = getUserId();
      if (!userId) return false;

      const leaderId =
        typeof team.leader_id === "object" && (team.leader_id as any)?.$oid
          ? (team.leader_id as any).$oid
          : team.leader_id;

      return userId === leaderId;
    },
    [getUserId],
  );

  const getUserRoleInTeam = useCallback(
    (team: Team): TeamRole | null => {
      const userId = getUserId();
      if (!userId) return null;

      const member = team.members.find((m) => {
        const memberId =
          typeof m.user_id === "object" && (m.user_id as any)?.$oid
            ? (m.user_id as any).$oid
            : m.user_id;
        return memberId === userId;
      });

      if (!member) return null;

      if (typeof member.role === "string") {
        return member.role as TeamRole;
      }
      return member.role;
    },
    [getUserId],
  );

  const hasTeamPermission = useCallback(
    (team: Team, permission: string): boolean => {
      const userId = getUserId();
      if (!userId) return false;

      const member = team.members.find((m) => {
        const memberId =
          typeof m.user_id === "object" && (m.user_id as any)?.$oid
            ? (m.user_id as any).$oid
            : m.user_id;
        return memberId === userId;
      });

      if (!member) return false;
      return member.permissions.includes(permission);
    },
    [getUserId],
  );

  const canEditTeam = useCallback(
    (team: Team): boolean => {
      return isTeamLeader(team);
    },
    [isTeamLeader],
  );

  const canManageTeamMembers = useCallback(
    (team: Team): boolean => {
      return isTeamLeader(team) || hasTeamPermission(team, "manage_members");
    },
    [isTeamLeader, hasTeamPermission],
  );

  const canDeleteTeam = useCallback(
    (team: Team): boolean => {
      return isTeamLeader(team);
    },
    [isTeamLeader],
  );

  return {
    isAuthenticated,
    userTeams,
    canAccessTeam,
    isTeamMember,
    isTeamLeader,
    hasTeamPermission,
    canEditTeam,
    canManageTeamMembers,
    canDeleteTeam,
    getUserRoleInTeam,
  };
};

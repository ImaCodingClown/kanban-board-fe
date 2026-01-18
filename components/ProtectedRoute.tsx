import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter, Href } from "expo-router";
import { useAuth } from "@/store/authStore";
import { usePermission } from "@/hooks/usePermission";
import { UI_CONSTANTS } from "@/constants/ui";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireTeam?: string;
  redirectTo?: Href;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireTeam,
  redirectTo = "/login" as Href,
}) => {
  const router = useRouter();
  const checkTokenExpiry = useAuth((state) => state.checkTokenExpiry);
  const accessToken = useAuth((state) => state.accessToken);
  const user = useAuth((state) => state.user);
  const { canAccessTeam } = usePermission();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsChecking(true);

      if (requireAuth) {
        if (!accessToken || !user) {
          router.replace(redirectTo);
          return;
        }

        const isTokenValid = checkTokenExpiry();
        if (!isTokenValid) {
          router.replace(redirectTo);
          return;
        }
      }

      if (requireTeam) {
        if (!canAccessTeam(requireTeam)) {
          router.replace("/teams" as Href);
          return;
        }
      }

      setIsAuthorized(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [
    requireAuth,
    requireTeam,
    accessToken,
    user,
    checkTokenExpiry,
    canAccessTeam,
    router,
    redirectTo,
  ]);

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={UI_CONSTANTS.COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (!isAuthorized) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Text style={styles.unauthorizedText}>Access Denied</Text>
        <Text style={styles.unauthorizedSubtext}>
          You don't have permission to access this page.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const accessToken = useAuth((state) => state.accessToken);
  const user = useAuth((state) => state.user);
  const checkTokenExpiry = useAuth((state) => state.checkTokenExpiry);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!accessToken || !user) {
      router.replace("/login" as Href);
      return;
    }

    const isValid = checkTokenExpiry();
    if (!isValid) {
      router.replace("/login" as Href);
      return;
    }

    setIsReady(true);
  }, [accessToken, user, checkTokenExpiry, router]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={UI_CONSTANTS.COLORS.PRIMARY} />
      </View>
    );
  }

  return <>{children}</>;
};

interface TeamGuardProps {
  children: React.ReactNode;
  teamName: string;
}

export const TeamGuard: React.FC<TeamGuardProps> = ({ children, teamName }) => {
  const router = useRouter();
  const { isAuthenticated, canAccessTeam } = usePermission();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login" as Href);
      return;
    }

    if (!canAccessTeam(teamName)) {
      router.replace("/teams" as Href);
      return;
    }

    setIsReady(true);
  }, [isAuthenticated, canAccessTeam, teamName, router]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={UI_CONSTANTS.COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Verifying team access...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
    padding: 20,
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: "bold",
    color: UI_CONSTANTS.COLORS.ERROR,
    marginBottom: 12,
  },
  unauthorizedSubtext: {
    fontSize: 16,
    color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: "center",
  },
});

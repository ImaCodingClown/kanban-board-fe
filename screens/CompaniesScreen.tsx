import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/authStore";
import { companyService } from "@/services/company";
import { Company, CompanyRole } from "@/models/company";
import { Toast } from "@/components/Toast";
import { formatErrorMessage, canRetry, getRetryAfter } from "@/services/api";
import { UI_CONSTANTS } from "@/constants/ui";

export const CompaniesScreen = () => {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const accessToken = useAuth((state) => state.accessToken);
  const checkTokenExpiry = useAuth((state) => state.checkTokenExpiry);
  const logout = useAuth((state) => state.logout);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onRetry: undefined as (() => void) | undefined,
    retryAfter: undefined as number | undefined,
  });

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info",
      onRetry?: () => void,
      retryAfter?: number,
    ) => {
      setToast({
        visible: true,
        message,
        type,
        onRetry,
        retryAfter,
      });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const loadCompanies = useCallback(async () => {
    if (!user || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      // placeholder with mock data
      // This will be replaced with actual API call when backend is ready
      const userGroups = (user as any).group || [];
      
      if (userGroups.length === 0) {
        // placeholder with mock data
        const isTony = user.username.toLowerCase() === "tony";
        const mockCompanies: Company[] = [
          {
            _id: "default",
            name: isTony ? "LJY Software" : "My Company",
            description: isTony
              ? "A software development company focused on building innovative solutions."
              : "Default company",
            owner_id: isTony ? user.id : user.id,
            owner_username: isTony ? "tony" : user.username,
            members: [
              {
                user_id: user.id,
                username: user.username,
                email: user.email,
                role: isTony ? CompanyRole.Owner : CompanyRole.Member,
                joined_at: new Date().toISOString(),
              },
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
          },
        ];
        setCompanies(mockCompanies);
      } else {
        // Map groups to companies
        const isTony = user.username.toLowerCase() === "tony";
        const mockCompanies: Company[] = userGroups.map((group: string, index: number) => ({
          _id: `company-${index}`,
          name: group,
          description: `Company: ${group}`,
          owner_id: isTony ? user.id : "owner-id",
          owner_username: isTony ? "tony" : "owner",
          members: [
            {
              user_id: user.id,
              username: user.username,
              email: user.email,
              role: isTony ? "Owner" : "Member",
              joined_at: new Date().toISOString(),
            },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        }));
        setCompanies(mockCompanies);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        router.replace("/login");
        return;
      }

      const errorMessage = formatErrorMessage(error);
      const canRetryError = canRetry(error);
      const retryAfter = getRetryAfter(error);

      if (canRetryError) {
        showToast(
          `${errorMessage} Automatically retrying...`,
          "warning",
          () => loadCompanies(),
          retryAfter || undefined,
        );
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  }, [user, accessToken, logout, router, showToast]);

  useEffect(() => {
    if (accessToken && user) {
      const isTokenValid = checkTokenExpiry();
      if (isTokenValid) {
        loadCompanies();
      } else {
        logout();
        router.replace("/login");
      }
    } else {
      setLoading(false);
    }
  }, [accessToken, user, checkTokenExpiry, logout, router, loadCompanies]);

  const handleCompanySelect = (company: Company) => {
    const companyId = company._id || company.name;
    router.push(`/company/${companyId}` as any);
  };

  const renderCompanyCard = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={styles.companyCard}
      onPress={() => handleCompanySelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.companyCardContent}>
        <View style={styles.companyIconContainer}>
          <Ionicons name="business" size={32} color="#1976D2" />
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.name}</Text>
          <Text style={styles.companySubtext}>
            {item.description || "No description"}
          </Text>
          <Text style={styles.companyMembers}>
            {item.members.length} member{item.members.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <View style={styles.companyActions}>
          <Ionicons
            name="chevron-forward"
            size={UI_CONSTANTS.ICON_SIZES.LARGE}
            color={UI_CONSTANTS.COLORS.TEXT_SECONDARY}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading companies...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Not authenticated</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.primaryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Companies</Text>
      </View>

      {companies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={80} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No companies yet</Text>
          <Text style={styles.emptySubtext}>
            You are not part of any companies
          </Text>
        </View>
      ) : (
        <FlatList
          data={companies}
          renderItem={renderCompanyCard}
          keyExtractor={(item) => {
            const raw = (item as any)._id;
            if (raw && typeof raw === "object" && "$oid" in raw) {
              return (raw as any).$oid as string;
            }
            return String(item._id || item.name);
          }}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  listContainer: {
    padding: 20,
  },
  companyCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  companyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  companySubtext: {
    fontSize: 14,
    color: "#8E8E93",
  },
  companyMembers: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  companyActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_CONSTANTS.SPACING.MEDIUM,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 30,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorText: {
    fontSize: 18,
    color: "#FF3B30",
    marginTop: 10,
    marginBottom: 20,
  },
});


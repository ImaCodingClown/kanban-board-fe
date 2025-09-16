import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/authStore";
import { teamsService } from "@/services/teams";
import { Team } from "@/models/teams";
import { FindMembersModal } from "@/components/FindMembersModal";
import { Toast } from "@/components/Toast";
import { formatErrorMessage, canRetry, getRetryAfter } from "@/services/api";

declare global {
  var openCreateTeamModal: (() => void) | undefined;
}

export const TeamsScreen = () => {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const accessToken = useAuth((state) => state.accessToken);
  const checkTokenExpiry = useAuth((state) => state.checkTokenExpiry);
  const logout = useAuth((state) => state.logout);
  const setSelectedTeam = useAuth((state) => state.setSelectedTeam);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [findMembersModalVisible, setFindMembersModalVisible] = useState(false);
  const [selectedTeamForMembers, setSelectedTeamForMembers] =
    useState<Team | null>(null);

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onRetry: undefined as (() => void) | undefined,
    retryAfter: undefined as number | undefined,
  });
  useEffect(() => {
    global.openCreateTeamModal = () => {
      setCreateModalVisible(true);
    };

    return () => {
      global.openCreateTeamModal = undefined;
    };
  }, []);

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

  const loadTeams = useCallback(async () => {
    if (!user || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await teamsService.getUserTeams();
      if (response.success) {
        setTeams(response.teams);
        if (response.teams.length === 0) {
          showToast("No teams yet. Create a new team to get started!", "info");
        }
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
          () => loadTeams(),
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
        loadTeams();
      } else {
        logout();
        router.replace("/login");
      }
    } else {
      setLoading(false);
    }
  }, [accessToken, user, checkTokenExpiry, logout, router, loadTeams]);

  const handleFindMembers = (team: Team) => {
    setSelectedTeamForMembers(team);
    setFindMembersModalVisible(true);
  };

  const handleMemberAdded = (updatedTeam: Team) => {
    setTeams(
      teams.map((team) => (team._id === updatedTeam._id ? updatedTeam : team)),
    );
  };

  const isUserTeamLeader = (team: Team) => {
    const userId =
      typeof user?.id === "object" && (user?.id as any)?.$oid
        ? (user.id as any).$oid
        : user?.id;
    const leaderId =
      typeof team.leader_id === "object" && (team.leader_id as any)?.$oid
        ? (team.leader_id as any).$oid
        : team.leader_id;

    return userId === leaderId;
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      showToast("Please enter a team name.", "warning");
      return;
    }

    setCreating(true);
    try {
      const response = await teamsService.createTeam({
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || undefined,
      });

      if (response.success) {
        setTeams([...teams, response.team]);
        setCreateModalVisible(false);
        setNewTeamName("");
        setNewTeamDescription("");
        showToast("Team created successfully!", "success");
        loadTeams();
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
          `${errorMessage} Would you like to retry?`,
          "warning",
          () => handleCreateTeam(),
          retryAfter || undefined,
        );
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteTeam = (team: Team) => {
    if (team.name === "LJY Soft") {
      showToast("LJY Soft team cannot be deleted.", "warning");
      return;
    }
    setTeamToDelete(team);
    setDeleteModalVisible(true);
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    setDeleting(true);
    try {
      const response = await teamsService.deleteTeam(teamToDelete.name);
      if (response.success) {
        setTeams(teams.filter((team) => team._id !== teamToDelete._id));
        const currentSelectedTeam = useAuth.getState().selectedTeam;
        if (currentSelectedTeam === teamToDelete.name) {
          setSelectedTeam(undefined);
        }
        setDeleteModalVisible(false);
        setTeamToDelete(null);
        showToast("Team deleted successfully!", "success");
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
          `${errorMessage} Would you like to retry?`,
          "warning",
          () => handleDeleteTeam(),
          retryAfter || undefined,
        );
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectTeam = (teamName: string) => {
    setSelectedTeam(teamName);
    router.push("/board");
  };

  const renderTeamCard = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => handleSelectTeam(item.name)}
      activeOpacity={0.7}
    >
      <View style={styles.teamCardContent}>
        <View style={styles.teamIconContainer}>
          <Ionicons name="people" size={32} color="#007AFF" />
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.name}</Text>
          <Text style={styles.teamSubtext}>
            {item.description || "No description"}
          </Text>
          <Text style={styles.teamMembers}>
            {item.members.length} member{item.members.length !== 1 ? "s" : ""}
          </Text>
        </View>

        <View style={styles.teamActions}>
          {isUserTeamLeader(item) && (
            <TouchableOpacity
              style={styles.findMembersButton}
              onPress={(e) => {
                e.stopPropagation();
                handleFindMembers(item);
              }}
            >
              <Ionicons name="person-add-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
          {item.name !== "LJY Soft" && isUserTeamLeader(item) && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                confirmDeleteTeam(item);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading teams...</Text>
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
        <Text style={styles.headerTitle}>My Teams</Text>
      </View>

      {teams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={80} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No teams yet</Text>
          <Text style={styles.emptySubtext}>
            Click "Create New Team" button above to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          renderItem={renderTeamCard}
          keyExtractor={(item) => item._id || item.name}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Team</Text>
              <TouchableOpacity
                onPress={() => {
                  setCreateModalVisible(false);
                  setNewTeamName("");
                  setNewTeamDescription("");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter team name"
              value={newTeamName}
              onChangeText={setNewTeamName}
              autoFocus
              maxLength={50}
            />

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Enter team description (optional)"
              value={newTeamDescription}
              onChangeText={setNewTeamDescription}
              maxLength={200}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setCreateModalVisible(false);
                  setNewTeamName("");
                  setNewTeamDescription("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalCreateButton,
                  creating && styles.disabledButton,
                ]}
                onPress={handleCreateTeam}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!deleting) {
            setDeleteModalVisible(false);
            setTeamToDelete(null);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteIconContainer}>
              <Ionicons name="warning" size={56} color="#FF9500" />
            </View>

            <Text style={styles.deleteModalTitle}>Delete Team</Text>

            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete{" "}
              <Text style={styles.teamNameHighlight}>
                "{teamToDelete?.name}"
              </Text>
              ?
            </Text>
            <Text style={styles.deleteModalSubtext}>
              This action cannot be undone and you will lose access to all
              boards and data associated with this team.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  if (!deleting) {
                    setDeleteModalVisible(false);
                    setTeamToDelete(null);
                  }
                }}
                disabled={deleting}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.deleteConfirmButton,
                  deleting && styles.disabledButton,
                ]}
                onPress={handleDeleteTeam}
                disabled={deleting}
                activeOpacity={0.8}
              >
                {deleting ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.loadingText}>Deleting...</Text>
                  </View>
                ) : (
                  <View style={styles.deleteButtonContent}>
                    <Ionicons name="trash-outline" size={18} color="white" />
                    <Text style={styles.deleteButtonText}>Delete Team</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FindMembersModal
        visible={findMembersModalVisible}
        team={selectedTeamForMembers}
        onClose={() => {
          setFindMembersModalVisible(false);
          setSelectedTeamForMembers(null);
        }}
        onMemberAdded={handleMemberAdded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
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
  teamCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  teamIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  teamSubtext: {
    fontSize: 14,
    color: "#8E8E93",
  },
  teamMembers: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  teamActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFF0F0",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  deleteModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 32,
    width: "90%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
  },
  cancelButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCreateButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF8E1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
    marginBottom: 16,
  },
  deleteModalMessage: {
    fontSize: 17,
    color: "#3A3A3C",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  teamNameHighlight: {
    fontWeight: "700",
    color: "#FF3B30",
  },
  deleteModalSubtext: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  deleteConfirmButton: {
    backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  findMembersButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
  },
});

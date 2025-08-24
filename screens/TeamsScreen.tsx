import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/authStore";
import { api } from "@/services/api";

declare global {
  var openCreateTeamModal: (() => void) | undefined;
}

export const TeamsScreen = () => {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const setUser = useAuth((state) => state.setUser);
  const setSelectedTeam = useAuth((state) => state.setSelectedTeam);
  const [teams, setTeams] = useState<string[]>(user?.teams || []);

  useEffect(() => {
    if (teams.length > 0) {
      console.log("Teams state changed:", teams);
      console.log("Teams length:", teams.length);
    }
  }, [teams]);
  const [loading, setLoading] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string>("");
  const [newTeamName, setNewTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    global.openCreateTeamModal = () => {
      setCreateModalVisible(true);
    };

    const token = useAuth.getState().token;
    console.log(
      "Component mounted, auth token status:",
      token ? "Present" : "Missing",
    );

    return () => {
      global.openCreateTeamModal = undefined;
    };
  }, []);

  useEffect(() => {
    if (user && user.teams) {
      console.log("User changed, updating teams state:", user.teams);
      setTeams(user.teams);
    }
  }, [user]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: me } = await api.get("/me");
      console.log("Fetched user teams from backend:", me.teams);

      if (me && me.teams) {
        console.log("Setting teams from backend:", me.teams);
        setTeams(me.teams);
      } else {
        console.log("Using fallback teams from user state:", user.teams);
        setTeams(user.teams || []);
      }
    } catch (error) {
      console.error("Failed to load teams:", error);
      if (user && user.teams) {
        console.log(
          "Using fallback teams from user state after error:",
          user.teams,
        );
        setTeams(user.teams);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      Alert.alert("Error", "Please enter a team name");
      return;
    }

    if (teams.includes(newTeamName.trim())) {
      Alert.alert("Error", "You are already a member of this team");
      return;
    }

    const token = useAuth.getState().token;
    console.log(
      "Current auth token:",
      token ? token.substring(0, 20) + "..." : "None",
    );

    if (!token) {
      Alert.alert(
        "Error",
        "Authentication token not found. Please login again.",
      );
      return;
    }

    setCreating(true);
    try {
      console.log("Creating board for team:", newTeamName.trim());
      console.log("Request headers:", api.defaults.headers);

      const boardResponse = await api.post("/board", {
        team: newTeamName.trim(),
      });

      console.log("Board response:", boardResponse.data);
      if (!boardResponse.data) {
        throw new Error("Failed to create board");
      }

      console.log("Creating team:", newTeamName.trim());
      const createResponse = await api.post("/teams/create", {
        team_name: newTeamName.trim(),
      });

      console.log("Create team response:", createResponse.data);
      console.log("Response success:", createResponse.data?.success);
      console.log("Response teams:", createResponse.data?.teams);

      if (!createResponse.data || !createResponse.data.success) {
        throw new Error("Failed to create team");
      }

      const updatedTeams = createResponse.data.teams || [
        ...teams,
        newTeamName.trim(),
      ];

      console.log("Creating team - Response teams:", createResponse.data.teams);
      console.log("Updated teams:", updatedTeams);

      setTeams(updatedTeams);

      const updatedUser = {
        ...user!,
        teams: updatedTeams,
      };
      setUser(updatedUser);

      console.log("Updated user:", updatedUser);

      setCreateModalVisible(false);
      setNewTeamName("");

      Alert.alert("Success", "Team created successfully!");
      console.log("Final teams state:", updatedTeams);
      console.log("Final user state:", updatedUser);

      setTimeout(() => {
        console.log("Refreshing teams from backend...");
        loadTeams();
      }, 500);
    } catch (error: any) {
      console.error("Failed to create team:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Failed to create team";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setCreating(false);
    }
  };

  const confirmDeleteTeam = (teamName: string) => {
    if (teamName === "LJY Members") {
      Alert.alert("Error", "Cannot delete the LJY Members team");
      return;
    }
    setTeamToDelete(teamName);
    setDeleteModalVisible(true);
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    setDeleting(true);
    try {
      const deleteResponse = await api.post("/teams/delete", {
        team_name: teamToDelete,
      });

      if (!deleteResponse.data || !deleteResponse.data.success) {
        throw new Error("Failed to delete team");
      }

      const updatedTeams =
        deleteResponse.data.teams ||
        teams.filter((team) => team !== teamToDelete);
      setTeams(updatedTeams);

      const updatedUser = {
        ...user!,
        teams: updatedTeams,
      };
      setUser(updatedUser);

      const currentSelectedTeam = useAuth.getState().selectedTeam;
      if (currentSelectedTeam === teamToDelete) {
        setSelectedTeam(undefined);
      }

      setDeleteModalVisible(false);
      setTeamToDelete("");
      Alert.alert("Success", "Team deleted successfully!");
    } catch (error: any) {
      console.error("Failed to delete team:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || error.message || "Failed to delete team",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectTeam = (teamName: string) => {
    setSelectedTeam(teamName);
    router.push("/board");
  };

  const renderTeamCard = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => handleSelectTeam(item)}
      activeOpacity={0.7}
    >
      <View style={styles.teamCardContent}>
        <View style={styles.teamIconContainer}>
          <Ionicons name="people" size={32} color="#007AFF" />
        </View>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item}</Text>
          <Text style={styles.teamSubtext}>Tap to view board</Text>
        </View>
        <View style={styles.teamActions}>
          {item !== "LJY Members" && (
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
        <Text style={styles.loadingText}>
          Current teams count: {teams.length}
        </Text>
        <Text style={styles.loadingText}>
          User teams: {user?.teams?.join(", ") || "None"}
        </Text>
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
          <Text style={styles.emptySubtext}>
            Debug: User teams from store: {user?.teams?.join(", ") || "None"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          renderItem={renderTeamCard}
          keyExtractor={(item) => item}
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

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setCreateModalVisible(false);
                  setNewTeamName("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createButton,
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
            setTeamToDelete("");
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            {/* Warning Icon */}
            <View style={styles.deleteIconContainer}>
              <Ionicons name="warning" size={56} color="#FF9500" />
            </View>

            {/* Title */}
            <Text style={styles.deleteModalTitle}>Delete Team</Text>

            {/* Message */}
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete{" "}
              <Text style={styles.teamNameHighlight}>"{teamToDelete}"</Text>?
            </Text>
            <Text style={styles.deleteModalSubtext}>
              This action cannot be undone and you will lose access to all
              boards and data associated with this team.
            </Text>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  if (!deleting) {
                    setDeleteModalVisible(false);
                    setTeamToDelete("");
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
  createButton: {
    backgroundColor: "#007AFF",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
});

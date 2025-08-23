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
  const [teams, setTeams] = useState<string[]>([]);
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

    return () => {
      global.openCreateTeamModal = undefined;
    };
  }, []);

  useEffect(() => {
    loadTeams();
  }, [user]);

  const loadTeams = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setTeams(user.teams || []);
    } catch (error) {
      console.error("Failed to load teams:", error);
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

    setCreating(true);
    try {
      const response = await api.post("/board", {
        team: newTeamName.trim(),
      });

      if (response.data) {
        const updatedTeams = [...teams, newTeamName.trim()];

        const updateResponse = await api.post("/update-user-teams", {
          email: user!.email,
          teams: updatedTeams,
        });

        if (updateResponse.data) {
          setTeams(updatedTeams);

          const updatedUser = {
            ...user!,
            teams: updatedTeams,
          };
          setUser(updatedUser);

          setCreateModalVisible(false);
          setNewTeamName("");
          Alert.alert("Success", "Team created successfully!");
        }
      }
    } catch (error: any) {
      console.error("Failed to create team:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to create team",
      );
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
      const updatedTeams = teams.filter((team) => team !== teamToDelete);

      const updateResponse = await api.post("/update-user-teams", {
        email: user!.email,
        teams: updatedTeams,
      });

      if (updateResponse.data) {
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
        Alert.alert("Success", "Team removed successfully!");
      }
    } catch (error: any) {
      console.error("Failed to delete team:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to remove team",
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
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.deleteModalTitle}>Remove Team</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to leave "{teamToDelete}"?{"\n"}
              This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setTeamToDelete("");
                }}
                disabled={deleting}
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
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.deleteButtonText}>Remove</Text>
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
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
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
    gap: 12,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
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
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  deleteConfirmButton: {
    backgroundColor: "#FF3B30",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

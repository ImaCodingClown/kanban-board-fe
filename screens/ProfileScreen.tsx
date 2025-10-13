import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, User } from "@/store/authStore";
import { teamsService } from "@/services/teams";
import { Team } from "@/models/teams";
import { usersService } from "@/services/users";

export const ProfileScreen = () => {
  const user = useAuth((state) => state.user);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [slackUserId, setSlackUserId] = useState(user?.slack_user_id || "");
  const [isEditingSlackId, setIsEditingSlackId] = useState(false);
  const [savingSlackId, setSavingSlackId] = useState(false);

  useEffect(() => {
    const fetchUserTeams = async () => {
      if (user?.email) {
        try {
          setLoading(true);
          const response = await teamsService.getUserTeams();
          setUserTeams(response.teams);
        } catch (error) {
          console.error("Failed to fetch user teams:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserTeams();
  }, [user?.email]);

  const handleSaveSlackId = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    if (!slackUserId.trim()) {
      Alert.alert("Error", "Please enter a Slack User ID.");
      return;
    }

    try {
      setSavingSlackId(true);

      // Convert user ID to string if it's an object
      const userIdString =
        typeof user.id === "object" && user.id && "$oid" in user.id
          ? (user.id as any).$oid
          : String(user.id);

      const response = await usersService.updateSlackUserId(
        userIdString,
        slackUserId,
      );

      if (response.success) {
        Alert.alert("Success", "Slack ID updated successfully!");
        setIsEditingSlackId(false);

        // Update the user in auth store
        useAuth.getState().updateUserSlackId(slackUserId);
      } else {
        Alert.alert("Error", "Failed to update Slack ID. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to update Slack ID:", error);
      Alert.alert(
        "Error",
        `Failed to update Slack ID: ${error.message || "Unknown error"}`,
      );
    } finally {
      setSavingSlackId(false);
    }
  };

  const handleCancelEdit = () => {
    setSlackUserId(user?.slack_user_id || "");
    setIsEditingSlackId(false);
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Ionicons name="person-circle" size={80} color="#C7C7CC" />
        <Text style={styles.errorText}>You are not logged in.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#007AFF" />
        </View>

        <Text style={styles.title}>Profile Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Username</Text>
              <Text style={styles.value}>{user.username}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="logo-slack" size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Slack Integration</Text>
              {isEditingSlackId ? (
                <View style={styles.slackEditContainer}>
                  <TextInput
                    style={styles.slackInput}
                    value={slackUserId}
                    onChangeText={setSlackUserId}
                    placeholder="Enter your Slack User ID (e.g., U01ABC2DEF3)"
                    placeholderTextColor="#8E8E93"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <View style={styles.slackButtonContainer}>
                    <TouchableOpacity
                      style={[styles.slackButton, styles.saveButton]}
                      onPress={handleSaveSlackId}
                      disabled={savingSlackId}
                    >
                      <Text style={styles.saveButtonText}>
                        {savingSlackId ? "Saving..." : "Save"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.slackButton, styles.cancelButton]}
                      onPress={handleCancelEdit}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.slackDisplayContainer}>
                  <Text style={styles.value}>
                    {user.slack_user_id || "Not connected"}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditingSlackId(true)}
                  >
                    <Text style={styles.editButtonText}>
                      {user.slack_user_id ? "Edit" : "Connect"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.slackHelpText}>
                Connect your Slack account to receive notifications when
                assigned to cards. Find your Slack User ID in your Slack profile
                settings.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="people" size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Teams</Text>
              {loading ? (
                <Text style={styles.value}>Loading teams...</Text>
              ) : userTeams.length > 0 ? (
                <View style={styles.teamsList}>
                  {userTeams.map((team, index) => (
                    <View key={index} style={styles.teamItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.teamName}>{team.name}</Text>
                      {team.description && (
                        <Text style={styles.teamDescription}>
                          {" "}
                          - {team.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.value}>No teams</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  profileContainer: {
    padding: 20,
    alignItems: "center",
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000",
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: -20,
  },
  errorText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 10,
  },
  statsCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#000",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 5,
  },
  teamsList: {
    marginTop: 4,
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  bullet: {
    fontSize: 16,
    color: "#007AFF",
    marginRight: 8,
    fontWeight: "bold",
  },
  teamName: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  teamDescription: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  slackEditContainer: {
    marginTop: 8,
  },
  slackInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
    marginBottom: 12,
  },
  slackButtonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  slackButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  slackDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  editButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  slackHelpText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 8,
    lineHeight: 16,
  },
});

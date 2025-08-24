import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/store/authStore";

export const ProfileScreen = () => {
  const user = useAuth((state) => state.user);

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
            <Ionicons name="people" size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.label}>Teams</Text>
              {user.teams && user.teams.length > 0 ? (
                <View style={styles.teamsList}>
                  {user.teams.map((team, index) => (
                    <View key={index} style={styles.teamItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.teamName}>{team}</Text>
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
});

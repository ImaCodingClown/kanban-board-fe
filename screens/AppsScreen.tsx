import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/authStore";

export const AppsScreen = () => {
  const router = useRouter();
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const user = useAuth((state) => state.user);

  const modules = [
    {
      name: "Teams",
      icon: "people",
      route: "/teams",
      description: "Manage your teams and collaborate",
      color: "#007AFF",
      bgColor: "#F0F8FF",
    },
    {
      name: "Board",
      icon: "grid",
      route: "/board",
      description: "View and manage your kanban board",
      color: "#34C759",
      bgColor: "#F0FDF4",
      disabled: !selectedTeam,
    },
    {
      name: "Profile",
      icon: "person",
      route: "/profile",
      description: "View your profile and settings",
      color: "#FF9500",
      bgColor: "#FFF8F0",
    },
  ];

  const handleModulePress = (module: (typeof modules)[0]) => {
    if (module.disabled) {
      router.push("/teams");
    } else {
      router.push(module.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {user?.username || "User"}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modulesContainer}>
          {modules.map((module) => (
            <TouchableOpacity
              key={module.name}
              style={[
                styles.moduleCard,
                module.disabled && styles.disabledCard,
              ]}
              onPress={() => handleModulePress(module)}
              activeOpacity={0.7}
            >
              <View style={styles.moduleCardContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: module.bgColor },
                  ]}
                >
                  <Ionicons
                    name={module.icon as any}
                    size={32}
                    color={module.disabled ? "#C7C7CC" : module.color}
                  />
                </View>

                <View style={styles.moduleContent}>
                  <Text
                    style={[
                      styles.moduleName,
                      module.disabled && styles.disabledText,
                    ]}
                  >
                    {module.name}
                  </Text>
                  <Text
                    style={[
                      styles.moduleDescription,
                      module.disabled && styles.disabledText,
                    ]}
                  >
                    {module.disabled
                      ? "Select a team first"
                      : module.description}
                  </Text>
                </View>

                <View style={styles.moduleAction}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={module.disabled ? "#C7C7CC" : "#8E8E93"}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#8E8E93",
  },
  scrollContainer: {
    flex: 1,
  },
  modulesContainer: {
    padding: 20,
  },
  moduleCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moduleCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  disabledCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  moduleContent: {
    flex: 1,
    justifyContent: "center",
  },
  moduleName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  disabledText: {
    color: "#C7C7CC",
  },
  moduleAction: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 10,
  },
});

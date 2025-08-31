import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/store/authStore";

export const NavigationBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleHomePress = () => {
    router.push("/teams");
  };

  const handleBoardPress = () => {
    if (selectedTeam) {
      router.push("/board");
    } else {
      router.push("/teams");
    }
  };

  const handleProfilePress = () => {
    setShowProfileDropdown(false);
    router.push("/profile");
  };

  const handleLogout = async () => {
    try {
      const logout = useAuth.getState().logout;

      logout();
      setShowProfileDropdown(false);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleCreateTeam = () => {
    if (global.openCreateTeamModal) {
      global.openCreateTeamModal();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <View style={styles.navContent}>
          <TouchableOpacity style={styles.homeButton} onPress={handleHomePress}>
            <Text style={styles.homeText}>LJY</Text>
          </TouchableOpacity>

          <View style={styles.navLinks}>
            <TouchableOpacity
              style={[
                styles.navLink,
                pathname === "/teams" && styles.activeNavLink,
              ]}
              onPress={() => router.push("/teams")}
            >
              <Ionicons
                name="people"
                size={20}
                color={pathname === "/teams" ? "#007AFF" : "#666"}
              />
              <Text
                style={[
                  styles.navLinkText,
                  pathname === "/teams" && styles.activeNavLinkText,
                ]}
              >
                Teams
              </Text>
            </TouchableOpacity>

            {selectedTeam && (
              <TouchableOpacity
                style={[
                  styles.navLink,
                  pathname === "/board" && styles.activeNavLink,
                ]}
                onPress={handleBoardPress}
              >
                <Ionicons
                  name="grid"
                  size={20}
                  color={pathname === "/board" ? "#007AFF" : "#666"}
                />
                <Text
                  style={[
                    styles.navLinkText,
                    pathname === "/board" && styles.activeNavLinkText,
                  ]}
                >
                  Board
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.rightSection}>
            {selectedTeam && pathname === "/board" && (
              <View style={styles.currentTeamBadge}>
                <Text style={styles.currentTeamText}>
                  Current Team: {selectedTeam}
                </Text>
              </View>
            )}

            {pathname === "/teams" && (
              <TouchableOpacity
                style={styles.createTeamButton}
                onPress={handleCreateTeam}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.createTeamButtonText}>Create New Team</Text>
              </TouchableOpacity>
            )}

            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={toggleProfileDropdown}
              >
                <Ionicons name="person-circle" size={28} color="#007AFF" />
                <Ionicons
                  name={showProfileDropdown ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#007AFF"
                />
              </TouchableOpacity>

              {showProfileDropdown && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleProfilePress}
                  >
                    <Ionicons name="person" size={20} color="#333" />
                    <Text style={styles.dropdownText}>Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.lastDropdownItem]}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out" size={20} color="#FF3B30" />
                    <Text style={[styles.dropdownText, styles.logoutText]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#FFFFFF",
  },
  navbar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E1E1E1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  navContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
  },
  homeText: {
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "600",
  },
  navLinks: {
    flexDirection: "row",
    flex: 1,
    marginLeft: 20,
    gap: 16,
  },
  navLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeNavLink: {
    backgroundColor: "#F0F8FF",
  },
  navLinkText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  activeNavLinkText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currentTeamBadge: {
    backgroundColor: "#F0F8FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#007AFF20",
  },
  currentTeamText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  createTeamButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },
  createTeamButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  profileSection: {
    position: "relative",
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E1E1E1",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    minWidth: 150,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  logoutText: {
    color: "#FF3B30",
  },
});

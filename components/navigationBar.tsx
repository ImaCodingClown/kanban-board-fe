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
import { useBoard } from "@/hooks/useBoard";
import { UI_CONSTANTS } from "@/constants/ui";
import { BoardSelectorModal } from "@/components/BoardSelectorModal";

export const NavigationBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showBoardSelector, setShowBoardSelector] = useState(false);

  // Get current board data for display
  const { data: currentBoard } = useBoard();

  const handleHomePress = () => {
    router.push("/apps");
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
                size={UI_CONSTANTS.ICON_SIZES.MEDIUM}
                color={
                  pathname === "/teams"
                    ? UI_CONSTANTS.COLORS.PRIMARY
                    : UI_CONSTANTS.COLORS.TEXT_TERTIARY
                }
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
                  size={UI_CONSTANTS.ICON_SIZES.MEDIUM}
                  color={
                    pathname === "/board"
                      ? UI_CONSTANTS.COLORS.PRIMARY
                      : UI_CONSTANTS.COLORS.TEXT_TERTIARY
                  }
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
              <TouchableOpacity
                style={styles.currentBoardBadge}
                onPress={() => setShowBoardSelector(true)}
              >
                <Text style={styles.currentBoardText}>
                  {currentBoard?.board_name || "Select Board"}
                </Text>
                <Text style={styles.currentTeamText}>Team: {selectedTeam}</Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={UI_CONSTANTS.COLORS.PRIMARY}
                />
              </TouchableOpacity>
            )}

            {pathname === "/teams" && (
              <TouchableOpacity
                style={styles.createTeamButton}
                onPress={handleCreateTeam}
              >
                <Ionicons
                  name="add-circle"
                  size={UI_CONSTANTS.ICON_SIZES.MEDIUM}
                  color="white"
                />
                <Text style={styles.createTeamButtonText}>Create New Team</Text>
              </TouchableOpacity>
            )}

            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={toggleProfileDropdown}
              >
                <Ionicons
                  name="person-circle"
                  size={UI_CONSTANTS.ICON_SIZES.XLARGE}
                  color={UI_CONSTANTS.COLORS.PRIMARY}
                />
                <Ionicons
                  name={showProfileDropdown ? "chevron-up" : "chevron-down"}
                  size={UI_CONSTANTS.ICON_SIZES.SMALL}
                  color={UI_CONSTANTS.COLORS.PRIMARY}
                />
              </TouchableOpacity>

              {showProfileDropdown && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleProfilePress}
                  >
                    <Ionicons
                      name="person"
                      size={UI_CONSTANTS.ICON_SIZES.MEDIUM}
                      color={UI_CONSTANTS.COLORS.TEXT_PRIMARY}
                    />
                    <Text style={styles.dropdownText}>Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.lastDropdownItem]}
                    onPress={handleLogout}
                  >
                    <Ionicons
                      name="log-out"
                      size={UI_CONSTANTS.ICON_SIZES.MEDIUM}
                      color={UI_CONSTANTS.COLORS.ERROR}
                    />
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

      {/* Board Selector Modal */}
      <BoardSelectorModal
        visible={showBoardSelector}
        onClose={() => setShowBoardSelector(false)}
        selectedTeam={selectedTeam || ""}
      />
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
    backgroundColor: UI_CONSTANTS.COLORS.CARD_BACKGROUND,
  },
  navbar: {
    backgroundColor: UI_CONSTANTS.COLORS.CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: UI_CONSTANTS.COLORS.BORDER_LIGHT,
    paddingVertical: UI_CONSTANTS.SPACING.MEDIUM,
    paddingHorizontal: UI_CONSTANTS.SPACING.XLARGE,
    ...UI_CONSTANTS.SHADOW.NAVBAR,
  },
  navContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: UI_CONSTANTS.SPACING.SMALL,
    paddingHorizontal: UI_CONSTANTS.SPACING.MEDIUM,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: UI_CONSTANTS.COLORS.PRIMARY_BACKGROUND,
  },
  homeText: {
    fontSize: UI_CONSTANTS.FONT_SIZES.XXLARGE,
    color: UI_CONSTANTS.COLORS.PRIMARY,
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
  currentBoardBadge: {
    backgroundColor: UI_CONSTANTS.COLORS.PRIMARY_BACKGROUND,
    paddingVertical: UI_CONSTANTS.SPACING.SMALL,
    paddingHorizontal: UI_CONSTANTS.SPACING.MEDIUM,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.MEDIUM,
    borderWidth: 1,
    borderColor: UI_CONSTANTS.COLORS.PRIMARY + "20",
    alignItems: "center",
    flexDirection: "row",
    gap: UI_CONSTANTS.SPACING.SMALL,
  },
  currentBoardText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "700",
    marginBottom: 2,
  },
  currentTeamText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
    opacity: 0.8,
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

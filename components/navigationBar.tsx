import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/store/authStore";
import { AddCardModal } from "./AddCardModal";
import { TeamSelector } from "./teamSelector";
import { addCard, getColumns } from "@/services/card";
import { useCreateBoard } from "../hooks/useBoard";

export const NavigationBar: React.FC = () => {
  const router = useRouter();
  const setToken = useAuth((state) => state.setToken);
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const { mutate: createBoard, isLoading } = useCreateBoard();

  const handleHomePress = () => {
    router.push("/board");
  };

  const handleProfilePress = () => {
    setShowProfileDropdown(false);
    router.push("/profile");
  };

  const handleLogout = async () => {
    try {
      const setToken = useAuth.getState().setToken;
      const setUser = useAuth.getState().setUser;
      const setSelectedTeam = useAuth.getState().setSelectedTeam;

      setToken(null);
      setUser(null);
      setSelectedTeam(undefined);
      setShowProfileDropdown(false);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleSubmitCard = async (
    title: string,
    description: string,
    columnTitle: string,
    storyPoint: number,
  ) => {
    if (!selectedTeam) {
      console.error("No team selected.");
      return;
    }

    try {
      await addCard({
        title,
        description,
        columnTitle,
        storyPoint,
        team: selectedTeam,
      });
    } catch (e) {
      console.error("Adding card failed: ", e);
    }
  };

  const handleOpenModal = async () => {
    if (!selectedTeam) {
      console.error("No team selected.");
      return;
    }

    try {
      const columnTitles = await getColumns(selectedTeam);
      setColumns(columnTitles);
      setModalVisible(true);
    } catch (e) {
      console.error("Failed to fetch columns:", e);
    }
  };

  const handleCreateBoard = () => {
    if (!selectedTeam) {
      console.error("No team selected.");
      return;
    }
    createBoard();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <View style={styles.navContent}>
          <TouchableOpacity style={styles.homeButton} onPress={handleHomePress}>
            <Text style={styles.homeText}>LJY</Text>
          </TouchableOpacity>

          {/* <TeamSelector /> */}

          <View style={styles.rightButton}>
            <TouchableOpacity
              style={[
                styles.extraButton,
                !selectedTeam && styles.disabledButton,
              ]}
              onPress={handleCreateBoard}
              disabled={!selectedTeam}
            >
              <Text
                style={[
                  styles.extraButtonText,
                  !selectedTeam && styles.disabledText,
                ]}
              >
                Create Board
              </Text>
            </TouchableOpacity>

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
  profileSection: {
    position: "relative",
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
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
  rightButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  extraButton: {
    marginLeft: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F0F8FF",
  },
  extraButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  disabledText: {
    color: "#999",
  },
  disabledButton: {
    backgroundColor: "#f5f5f5",
  },
});

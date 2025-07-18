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
import { ColumnModel } from "../models/board";
import { addCard, getColumns } from "@/services/card";
import { useCreateBoard } from "../hooks/useBoard";

export const NavigationBar: React.FC<{
  columns: ColumnModel[];
  onSubmitCard: (
    title: string,
    description: string,
    columnTitle: string,
  ) => Promise<void>;
}> = ({ onSubmitCard }) => {
  const router = useRouter();
  const setToken = useAuth((state) => state.setToken);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const { mutate: createBoard, isLoading } = useCreateBoard();

  const handleHomePress = () => {
    router.push("/board");
  };

  const handleLogout = async () => {
    try {
      setToken(null);
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
  ) => {
    const team = useAuth.getState().user?.teams?.[0];
    if (!team) {
      console.error("No team for the user.");
      return;
    }

    try {
      await addCard({ title, description, columnTitle, team });
    } catch (e) {
      console.error("Adding card failed: ", e);
    }
  };

  const handleOpenModal = async () => {
    const team = useAuth.getState().user?.teams?.[0];
    if (!team) {
      console.error("No team for the user.");
      return;
    }

    try {
      const columnTitles = await getColumns(team);
      setColumns(columnTitles);
      setModalVisible(true);
    } catch (e) {
      console.error("Failed to fetch columns:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <View style={styles.navContent}>
          {/* Home Button */}
          <TouchableOpacity style={styles.homeButton} onPress={handleHomePress}>
            <Text style={styles.homeText}>LJY</Text>
          </TouchableOpacity>

          {/* Right Section with Extra Buttons */}
          <View style={styles.rightButton}>
            <TouchableOpacity
              style={styles.extraButton}
              onPress={() => createBoard()}
            >
              <Text style={styles.extraButtonText}>Create Board</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.extraButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.extraButtonText}>Add Card</Text>
            </TouchableOpacity>

            {/* User Profile Section */}
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

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <View style={styles.dropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setShowProfileDropdown(false);
                    }}
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
      <AddCardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitCard}
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
    //marginLeft: 8,
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
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "600",
  },
});

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UserFilterDropdownProps {
  availableUsers: string[];
  selectedUsers: string[];
  onToggleUser: (username: string) => void;
  onClearFilter: () => void;
  isOpen: boolean;
  onToggle: () => void;
  hasUnassignedCards: boolean;
}

export const UserFilterDropdown: React.FC<UserFilterDropdownProps> = ({
  availableUsers,
  selectedUsers,
  onToggleUser,
  onClearFilter,
  isOpen,
  onToggle,
  hasUnassignedCards,
}) => {
  const animatedOpacity = useRef(new Animated.Value(0)).current;
  const totalItems = availableUsers.length + (hasUnassignedCards ? 1 : 0);
  const dropdownHeight = Math.min(totalItems * 40 + 12, 240);

  useEffect(() => {
    Animated.timing(animatedOpacity, {
      toValue: isOpen ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedUsers.length > 0 && styles.filterButtonActive,
          ]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name="funnel"
            size={16}
            color={selectedUsers.length > 0 ? "#FFF" : "#007AFF"}
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedUsers.length > 0 && styles.filterButtonTextActive,
            ]}
          >
            Filter
          </Text>
          {selectedUsers.length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{selectedUsers.length}</Text>
            </View>
          )}
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color={selectedUsers.length > 0 ? "#FFF" : "#007AFF"}
          />
        </TouchableOpacity>

        {selectedUsers.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClearFilter}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={16} color="#FF3B30" />
          </TouchableOpacity>
        )}
      </View>

      {isOpen && (
        <Animated.View
          style={[
            styles.dropdown,
            {
              height: dropdownHeight,
              opacity: animatedOpacity,
            },
          ]}
        >
          <ScrollView
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {availableUsers.length === 0 && !hasUnassignedCards ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="person-outline" size={24} color="#C7C7CC" />
                <Text style={styles.emptyText}>No users</Text>
              </View>
            ) : (
              <>
                {hasUnassignedCards && (
                  <TouchableOpacity
                    key="__unassigned__"
                    style={[
                      styles.userItem,
                      selectedUsers.includes("__unassigned__") &&
                        styles.userItemSelected,
                    ]}
                    onPress={() => onToggleUser("__unassigned__")}
                    activeOpacity={0.7}
                  >
                    <View style={styles.userItemContent}>
                      <View
                        style={[
                          styles.userIconContainer,
                          selectedUsers.includes("__unassigned__") &&
                            styles.userIconContainerSelected,
                        ]}
                      >
                        <Ionicons
                          name="help-outline"
                          size={12}
                          color={
                            selectedUsers.includes("__unassigned__")
                              ? "#007AFF"
                              : "#8E8E93"
                          }
                        />
                      </View>
                      <Text
                        style={[
                          styles.userName,
                          selectedUsers.includes("__unassigned__") &&
                            styles.userNameSelected,
                        ]}
                        numberOfLines={1}
                      >
                        Unassigned
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        selectedUsers.includes("__unassigned__") &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {selectedUsers.includes("__unassigned__") && (
                        <Ionicons name="checkmark" size={12} color="#FFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                {availableUsers.map((username) => {
                  const isSelected = selectedUsers.includes(username);
                  return (
                    <TouchableOpacity
                      key={username}
                      style={[
                        styles.userItem,
                        isSelected && styles.userItemSelected,
                      ]}
                      onPress={() => onToggleUser(username)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.userItemContent}>
                        <View
                          style={[
                            styles.userIconContainer,
                            isSelected && styles.userIconContainerSelected,
                          ]}
                        >
                          <Ionicons
                            name="person"
                            size={12}
                            color={isSelected ? "#007AFF" : "#8E8E93"}
                          />
                        </View>
                        <Text
                          style={[
                            styles.userName,
                            isSelected && styles.userNameSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {username}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={12} color="#FFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 5,
    marginBottom: 0,
    marginTop: 7,
    zIndex: 1000,
    width: 180,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#007AFF",
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
    flex: 1,
  },
  filterButtonTextActive: {
    color: "#FFF",
  },
  filterBadge: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#007AFF",
  },
  clearButton: {
    backgroundColor: "#FFF",
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: "#FFF",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownScroll: {
    flex: 1,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F7",
  },
  userItemSelected: {
    backgroundColor: "#F0F8FF",
  },
  userItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 6,
  },
  userIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  userIconContainerSelected: {
    backgroundColor: "#E3F2FD",
  },
  userName: {
    fontSize: 13,
    color: "#000",
    fontWeight: "500",
    flex: 1,
  },
  userNameSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#C7C7CC",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 6,
  },
});

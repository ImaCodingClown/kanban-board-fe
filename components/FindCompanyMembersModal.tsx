import React, { useState, useEffect, useCallback } from "react";
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
import { companyService } from "@/services/company";
import { usersService } from "@/services/users";
import { Company } from "@/models/company";
import { User } from "@/models/users";

interface FindCompanyMembersModalProps {
  visible: boolean;
  company: Company | null;
  onClose: () => void;
  onMemberAdded: (updatedCompany: Company) => void;
}

export const FindCompanyMembersModal: React.FC<
  FindCompanyMembersModalProps
> = ({ visible, company, onClose, onMemberAdded }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingMember, setAddingMember] = useState<string | null>(null);

  const loadAllUsers = useCallback(async () => {
    try {
      const response = await usersService.getAllUsers();
      if (response.success) {
        const companyMemberIds =
          company?.members.map((member) => member.user_id) || [];
        const availableUsers = response.users.filter(
          (user) =>
            !companyMemberIds.includes(user.id) &&
            user.id !== company?.owner_id,
        );
        setAllUsers(availableUsers);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }, [company]);

  useEffect(() => {
    if (visible && company) {
      loadAllUsers();
    }
  }, [visible, company, loadAllUsers]);

  const handleAddMember = async (userToAdd: User) => {
    if (!company || !company._id) return;

    setAddingMember(userToAdd.id);
    try {
      const response = await companyService.addMember(
        company._id,
        userToAdd.id,
      );

      if (response.success && response.company) {
        // upon adding, remove added user from the search list
        setAllUsers(allUsers.filter((user) => user.id !== userToAdd.id));
        onMemberAdded(response.company);
        Alert.alert(
          "Success",
          `${userToAdd.username} has been added to the company!`,
        );
      }
    } catch (error: any) {
      console.error("Failed to add member:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add member",
      );
    } finally {
      setAddingMember(null);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setAllUsers([]);
    onClose();
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderUserCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleAddMember(item)}
      disabled={addingMember === item.id}
      activeOpacity={0.7}
    >
      <View style={styles.userCardContent}>
        <View style={styles.userIconContainer}>
          <Ionicons name="person" size={24} color="#1976D2" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
          {item.email && <Text style={styles.userEmail}>{item.email}</Text>}
        </View>
        <View style={styles.addButtonContainer}>
          {addingMember === item.id ? (
            <ActivityIndicator size="small" color="#1976D2" />
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddMember(item)}
            >
              <Ionicons name="add" size={20} color="#1976D2" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Add Members to "{company?.name}"
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search users by username or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />

          {filteredUsers.length === 0 ? (
            <View style={styles.emptyUsersContainer}>
              <Ionicons name="people-outline" size={48} color="#C7C7CC" />
              <Text style={styles.emptyUsersText}>
                {searchQuery
                  ? "No users found matching your search"
                  : "No users available to add"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              renderItem={renderUserCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.usersListContainer}
              showsVerticalScrollIndicator={false}
              style={styles.usersList}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
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
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  usersListContainer: {
    paddingBottom: 10,
  },
  usersList: {
    maxHeight: 400,
  },
  userCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    marginBottom: 10,
  },
  userCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  userIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#8E8E93",
  },
  addButtonContainer: {
    marginLeft: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyUsersContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyUsersText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 16,
    textAlign: "center",
  },
});

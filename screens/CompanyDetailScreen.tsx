import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/store/authStore";
import { companyService } from "@/services/company";
import {
  Company,
  CompanyMember,
  CompanyRole,
  CompanyWithUsernames,
} from "@/models/company";
import { Toast } from "@/components/Toast";
import { formatErrorMessage } from "@/services/api";
import { UI_CONSTANTS } from "@/constants/ui";
import { FindCompanyMembersModal } from "@/components/FindCompanyMembersModal";

export const CompanyDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuth((state) => state.user);
  const accessToken = useAuth((state) => state.accessToken);
  const checkTokenExpiry = useAuth((state) => state.checkTokenExpiry);
  const logout = useAuth((state) => state.logout);

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [findMembersModalVisible, setFindMembersModalVisible] = useState(false);
  const [removingMember, setRemovingMember] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
  });

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "warning" | "info") => {
      setToast({
        visible: true,
        message,
        type,
      });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const isOwner = () => {
    if (!company || !user) return false;
    const userUsername = user.username.toLowerCase();
    const ownerUsername = company.owner_username.toLowerCase();
    return (
      ownerUsername === "tony" ||
      ownerUsername === userUsername ||
      company.owner_id === user.id
    );
  };

  const loadCompany = useCallback(async () => {
    if (!user || !accessToken || !id) {
      setLoading(false);
      return;
    }

    try {
      // Get company with usernames for full details
      const response = await companyService.getCompanyWithUsernames(id);
      if (response.success && response.company) {
        const companyData = response.company;
        const company: Company = {
          _id: companyData._id,
          name: companyData.name,
          description: companyData.description,
          owner_id: companyData.owner_id,
          owner_username: companyData.owner_username,
          members: companyData.members,
          created_at: companyData.created_at,
          updated_at: companyData.updated_at,
          is_active: companyData.is_active,
        };
        setCompany(company);
        setEditingName(company.name);
        setEditingDescription(company.description || "");
      } else {
        showToast("Company not found", "error");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        router.replace("/login");
        return;
      }

      const errorMessage = formatErrorMessage(error);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [user, accessToken, id, logout, router, showToast]);

  useEffect(() => {
    if (accessToken && user) {
      const isTokenValid = checkTokenExpiry();
      if (isTokenValid) {
        loadCompany();
      } else {
        logout();
        router.replace("/login");
      }
    } else {
      setLoading(false);
    }
  }, [accessToken, user, checkTokenExpiry, logout, router, loadCompany]);

  const handleEdit = () => {
    if (isOwner()) {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    if (company) {
      setEditingName(company.name);
      setEditingDescription(company.description || "");
    }
    setIsEditing(false);
  };

  const handleMemberAdded = (updatedCompany: Company) => {
    setCompany(updatedCompany);
    // Reload company with usernames to get full member details
    loadCompany();
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!company || !company._id) return;

    setRemovingMember(memberId);
    try {
      const response = await companyService.removeMember(company._id, memberId);

      if (response.success && response.company) {
        // Reload company with usernames to get updated member list
        await loadCompany();
        showToast("Member removed successfully!", "success");
      } else {
        showToast(response.message || "Failed to remove member", "error");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        router.replace("/login");
        return;
      }

      const errorMessage = formatErrorMessage(error);
      showToast(errorMessage, "error");
    } finally {
      setRemovingMember(null);
    }
  };

  const handleSave = async () => {
    if (!company) return;

    if (!editingName.trim()) {
      showToast("Company name cannot be empty", "warning");
      return;
    }

    setSaving(true);
    try {
      if (!company._id) {
        showToast("Invalid company ID", "error");
        setSaving(false);
        return;
      }

      const response = await companyService.updateCompany(company._id, {
        name: editingName.trim(),
        description: editingDescription.trim() || undefined,
      });

      if (response.success && response.company) {
        const updatedCompany: Company = {
          ...company,
          name: response.company.name,
          description: response.company.description,
          updated_at: response.company.updated_at,
        };
        setCompany(updatedCompany);
        setIsEditing(false);
        showToast("Company updated successfully!", "success");
      } else {
        showToast(response.message || "Failed to update company", "error");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
        router.replace("/login");
        return;
      }

      const errorMessage = formatErrorMessage(error);
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const renderMember = ({ item }: { item: CompanyMember }) => {
    const canRemove =
      isOwner() &&
      item.role !== CompanyRole.Owner &&
      removingMember !== item.user_id;

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatar}>
            <Text style={styles.memberAvatarText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{item.username}</Text>
            <Text style={styles.memberEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.memberActions}>
          <View style={styles.memberRole}>
            <View
              style={[
                styles.roleBadge,
                item.role === CompanyRole.Owner && styles.ownerBadge,
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  item.role === CompanyRole.Owner && styles.ownerText,
                ]}
              >
                {item.role}
              </Text>
            </View>
          </View>
          {canRemove && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMember(item.user_id)}
              disabled={removingMember === item.user_id}
            >
              {removingMember === item.user_id ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Ionicons name="close-circle" size={24} color="#FF3B30" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading company...</Text>
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

  if (!company) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>Company not found</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Company Details</Text>
        {isOwner() && !isEditing && (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.companyInfoSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="business" size={48} color="#1976D2" />
          </View>

          {isEditing ? (
            <>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                value={editingName}
                onChangeText={setEditingName}
                placeholder="Enter company name"
                autoFocus
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={editingDescription}
                onChangeText={setEditingDescription}
                placeholder="Enter company description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </>
          ) : (
            <>
              <Text style={styles.companyName}>{company.name}</Text>
              <Text style={styles.companyDescription}>
                {company.description || "No description provided"}
              </Text>
            </>
          )}
        </View>

        <View style={styles.membersSection}>
          <View style={styles.membersSectionHeader}>
            <Text style={styles.sectionTitle}>
              Members ({company.members.length})
            </Text>
            {isOwner() && (
              <TouchableOpacity
                style={styles.addMemberButton}
                onPress={() => setFindMembersModalVisible(true)}
              >
                <Ionicons name="person-add" size={20} color="#1976D2" />
                <Text style={styles.addMemberButtonText}>Add Member</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={company.members}
            renderItem={renderMember}
            keyExtractor={(item) => item.user_id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <FindCompanyMembersModal
        visible={findMembersModalVisible}
        company={company}
        onClose={() => setFindMembersModalVisible(false)}
        onMemberAdded={handleMemberAdded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  editButton: {
    padding: 4,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  cancelButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  companyInfoSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  companyDescription: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    marginTop: 16,
    alignSelf: "flex-start",
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: "100%",
    marginBottom: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  membersSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  membersSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  addMemberButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  addMemberButtonText: {
    color: "#1976D2",
    fontSize: 14,
    fontWeight: "600",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  removeButton: {
    padding: 4,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1976D2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: "#8E8E93",
  },
  memberRole: {
    marginLeft: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
  },
  ownerBadge: {
    backgroundColor: "#E3F2FD",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
  },
  ownerText: {
    color: "#1976D2",
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
});

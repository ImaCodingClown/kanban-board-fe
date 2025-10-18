import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { useAuth } from "@/store/authStore";
import { useBoards, useCreateBoard, useDeleteBoard } from "@/hooks/useBoard";
import { BoardModel } from "@/models/board";
import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { UI_CONSTANTS, VALIDATION } from "@/constants/ui";
import { getErrorMessage, validateBoardName } from "@/utils/errorHandler";

export const BoardsScreen = () => {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const setSelectedBoard = useAuth((state) => state.setSelectedBoard);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [creating, setCreating] = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const { data: boards, isLoading, error } = useBoards(selectedTeam || "");
  const createBoardMutation = useCreateBoard();
  const deleteBoardMutation = useDeleteBoard();

  const handleCreateBoard = async () => {
    const validation = validateBoardName(newBoardName);
    if (!validation.isValid) {
      showToast(validation.error!, "warning");
      return;
    }

    if (!selectedTeam) {
      showToast("No team selected", "error");
      return;
    }

    setCreating(true);
    try {
      const newBoard = await createBoardMutation.mutateAsync({
        team: selectedTeam,
        board_name: newBoardName.trim(),
      });

      setCreateModalVisible(false);
      setNewBoardName("");
      showToast("Board created successfully!", "success");
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to create board"), "error");
    } finally {
      setCreating(false);
    }
  };

  const handleSelectBoard = (board: BoardModel) => {
    if (selectedTeam) {
      setSelectedBoard(selectedTeam, board._id!);
      router.push("/board");
    }
  };

  const handleDeleteBoard = (board: BoardModel) => {
    Alert.alert(
      "Delete Board",
      `Are you sure you want to delete "${board.board_name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBoardMutation.mutateAsync(board._id!);
              showToast("Board deleted successfully!", "success");
            } catch (error) {
              showToast(
                getErrorMessage(error, "Failed to delete board"),
                "error",
              );
            }
          },
        },
      ],
    );
  };

  const renderBoardCard = ({ item }: { item: BoardModel }) => (
    <TouchableOpacity
      style={styles.boardCard}
      onPress={() => handleSelectBoard(item)}
      activeOpacity={0.7}
    >
      <View style={styles.boardCardContent}>
        <View style={styles.boardIconContainer}>
          <Ionicons name="grid" size={32} color="#007AFF" />
        </View>
        <View style={styles.boardInfo}>
          <Text style={styles.boardName}>{item.board_name}</Text>
          <Text style={styles.boardSubtext}>
            {item.team} • {item.columns.length} columns
          </Text>
          <Text style={styles.boardCards}>
            {item.columns.reduce((total, col) => total + col.cards.length, 0)}{" "}
            cards
          </Text>
        </View>

        <View style={styles.boardActions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteBoard(item);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Not authenticated</Text>
      </View>
    );
  }

  if (!selectedTeam) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No team selected</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/teams")}
        >
          <Text style={styles.actionButtonText}>Go to Teams</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading boards...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading boards</Text>
        <Text style={styles.infoText}>{error.message}</Text>
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
        <Text style={styles.headerTitle}>Boards</Text>
        <Text style={styles.headerSubtitle}>Team: {selectedTeam}</Text>
      </View>

      {!boards || boards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="grid-outline" size={80} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No boards yet</Text>
          <Text style={styles.emptySubtext}>
            Create your first board to get started
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.createButtonText}>Create Board</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.createButtonContainer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setCreateModalVisible(true)}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.createButtonText}>Create New Board</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={boards}
            renderItem={renderBoardCard}
            keyExtractor={(item) => item._id || item.board_name}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Create Board Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Board</Text>
              <TouchableOpacity
                onPress={() => {
                  setCreateModalVisible(false);
                  setNewBoardName("");
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Enter board name"
              value={newBoardName}
              onChangeText={setNewBoardName}
              autoFocus
              maxLength={VALIDATION.BOARD_NAME.MAX_LENGTH}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setCreateModalVisible(false);
                  setNewBoardName("");
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalCreateButton,
                  creating && styles.disabledButton,
                ]}
                onPress={handleCreateBoard}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.createButtonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: UI_CONSTANTS.SPACING.XLARGE,
    paddingVertical: UI_CONSTANTS.SPACING.LARGE,
    backgroundColor: UI_CONSTANTS.COLORS.CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: UI_CONSTANTS.COLORS.BORDER,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: UI_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 16,
    color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
  },
  createButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  boardCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boardCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  boardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  boardInfo: {
    flex: 1,
  },
  boardName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  boardSubtext: {
    fontSize: 14,
    color: "#8E8E93",
  },
  boardCards: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  boardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFF0F0",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 30,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: UI_CONSTANTS.COLORS.PRIMARY,
    paddingHorizontal: UI_CONSTANTS.SPACING.XXLARGE,
    paddingVertical: UI_CONSTANTS.SPACING.MEDIUM,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    alignItems: "center",
    gap: UI_CONSTANTS.SPACING.SMALL,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
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
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: UI_CONSTANTS.MODAL.OVERLAY_BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: UI_CONSTANTS.COLORS.CARD_BACKGROUND,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.LARGE,
    padding: UI_CONSTANTS.SPACING.XXLARGE,
    width: UI_CONSTANTS.MODAL.WIDTH,
    maxWidth: UI_CONSTANTS.MODAL.MAX_WIDTH,
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
  },
  closeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: UI_CONSTANTS.COLORS.BORDER,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    padding: UI_CONSTANTS.SPACING.MEDIUM,
    fontSize: 16,
    marginBottom: UI_CONSTANTS.SPACING.XLARGE,
  },
  modalActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 20,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
  },
  cancelButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalCreateButton: {
    backgroundColor: "#007AFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

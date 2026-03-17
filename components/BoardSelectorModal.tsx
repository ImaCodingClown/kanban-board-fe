import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/authStore";
import { useBoards, useBoard } from "@/hooks/useBoard";
import { BoardModel } from "@/models/board";
import { UI_CONSTANTS } from "@/constants/ui";

interface BoardSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTeam: string;
}

export const BoardSelectorModal: React.FC<BoardSelectorModalProps> = ({
  visible,
  onClose,
  selectedTeam,
}) => {
  const router = useRouter();
  const { data: availableBoards } = useBoards(selectedTeam);
  const { data: currentBoard } = useBoard();

  const getSelectedBoard = useAuth((state) => state.getSelectedBoard);
  const setSelectedBoard = useAuth((state) => state.setSelectedBoard);

  const handleBoardSelect = (board: BoardModel) => {
    if (selectedTeam) {
      setSelectedBoard(selectedTeam, board._id!);
      onClose();
    }
  };

  const handleManageBoards = () => {
    onClose();
    router.push("/boards");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.boardListModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Board</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons
                name="close"
                size={24}
                color={UI_CONSTANTS.COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.boardList}>
            {availableBoards?.map((boardItem) => (
              <TouchableOpacity
                key={boardItem._id}
                style={[
                  styles.boardListItem,
                  boardItem._id === currentBoard?._id &&
                    styles.selectedBoardListItem,
                ]}
                onPress={() => handleBoardSelect(boardItem)}
              >
                <View style={styles.boardListItemContent}>
                  <View style={styles.boardListItemInfo}>
                    <Text
                      style={[
                        styles.boardListItemName,
                        boardItem._id === currentBoard?._id &&
                          styles.selectedBoardListItemName,
                      ]}
                    >
                      {boardItem.board_name}
                    </Text>
                    <Text style={styles.boardListItemStats}>
                      {boardItem.columns.reduce(
                        (total, col) => total + col.cards.length,
                        0,
                      )}{" "}
                      cards
                    </Text>
                  </View>
                  {boardItem._id === currentBoard?._id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={UI_CONSTANTS.COLORS.PRIMARY}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.manageBoardsFooterButton}
              onPress={handleManageBoards}
            >
              <Ionicons
                name="settings"
                size={20}
                color={UI_CONSTANTS.COLORS.PRIMARY}
              />
              <Text style={styles.manageBoardsFooterText}>Manage Boards</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: UI_CONSTANTS.MODAL.OVERLAY_BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
  },
  boardListModal: {
    backgroundColor: UI_CONSTANTS.COLORS.CARD_BACKGROUND,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.LARGE,
    width: UI_CONSTANTS.MODAL.WIDTH,
    maxWidth: UI_CONSTANTS.MODAL.MAX_WIDTH,
    maxHeight: UI_CONSTANTS.MODAL.MAX_HEIGHT,
    ...UI_CONSTANTS.SHADOW.MODAL,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: UI_CONSTANTS.SPACING.XXLARGE,
    paddingTop: UI_CONSTANTS.SPACING.XXLARGE,
    paddingBottom: UI_CONSTANTS.SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: UI_CONSTANTS.COLORS.BORDER,
  },
  modalTitle: {
    fontSize: UI_CONSTANTS.FONT_SIZES.XXLARGE,
    fontWeight: "700",
    color: UI_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: UI_CONSTANTS.SPACING.SMALL,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
  },
  boardList: {
    maxHeight: 400,
    paddingHorizontal: UI_CONSTANTS.SPACING.XXLARGE,
    paddingTop: UI_CONSTANTS.SPACING.SMALL,
  },
  boardListItem: {
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.MEDIUM,
    marginBottom: UI_CONSTANTS.SPACING.SMALL,
    ...UI_CONSTANTS.SHADOW.CARD,
  },
  selectedBoardListItem: {
    backgroundColor: UI_CONSTANTS.COLORS.PRIMARY_BACKGROUND,
    borderWidth: 2,
    borderColor: UI_CONSTANTS.COLORS.PRIMARY,
  },
  boardListItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: UI_CONSTANTS.SPACING.LARGE,
    paddingHorizontal: UI_CONSTANTS.SPACING.LARGE,
  },
  boardListItemInfo: {
    flex: 1,
  },
  boardListItemName: {
    fontSize: UI_CONSTANTS.FONT_SIZES.LARGE,
    fontWeight: "600",
    color: UI_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: UI_CONSTANTS.SPACING.SMALL / 2,
  },
  selectedBoardListItemName: {
    color: UI_CONSTANTS.COLORS.PRIMARY,
    fontWeight: "700",
  },
  boardListItemStats: {
    fontSize: UI_CONSTANTS.FONT_SIZES.SMALL,
    color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
    fontWeight: "500",
  },
  modalFooter: {
    paddingHorizontal: UI_CONSTANTS.SPACING.XXLARGE,
    paddingVertical: UI_CONSTANTS.SPACING.LARGE,
    borderTopWidth: 1,
    borderTopColor: UI_CONSTANTS.COLORS.BORDER,
  },
  manageBoardsFooterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: UI_CONSTANTS.SPACING.MEDIUM,
    paddingHorizontal: UI_CONSTANTS.SPACING.LARGE,
    backgroundColor: UI_CONSTANTS.COLORS.PRIMARY_BACKGROUND,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.MEDIUM,
    gap: UI_CONSTANTS.SPACING.SMALL,
  },
  manageBoardsFooterText: {
    fontSize: UI_CONSTANTS.FONT_SIZES.MEDIUM,
    fontWeight: "600",
    color: UI_CONSTANTS.COLORS.PRIMARY,
  },
});

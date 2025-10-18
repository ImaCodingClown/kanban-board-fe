import { DraxProvider, DraxView } from "react-native-drax";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useBoard, useUpdateBoard, useBoards } from "../hooks/useBoard";
import { BoardModel, CardModel, ColumnModel } from "../models/board";
import { AddCardModal } from "@/components/AddCardModal";
import { addCard, deleteCard, editCard } from "@/services/card";
import { useAuth } from "@/store/authStore";
import { EditCardModal } from "@/components/EditCardModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useToast } from "@/hooks/useToast";
import { UI_CONSTANTS } from "@/constants/ui";
import { getErrorMessage } from "@/utils/errorHandler";

const { width } = Dimensions.get("window");

export const BoardScreen = () => {
  const router = useRouter();
  const { data, isLoading, error } = useBoard();
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const user = useAuth((state) => state.user);
  const getSelectedBoard = useAuth((state) => state.getSelectedBoard);
  const setSelectedBoard = useAuth((state) => state.setSelectedBoard);

  const [columns, setColumns] = useState<ColumnModel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeColumn, setActiveColumn] = useState<string>("");
  const updateBoardMutation = useUpdateBoard();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<
    (CardModel & { columnTitle: string }) | null
  >(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<{
    id: string;
    columnTitle: string;
    title: string;
  } | null>(null);

  // Board selector states
  const [boardSelectorVisible, setBoardSelectorVisible] = useState(false);
  const { data: availableBoards } = useBoards(selectedTeam || "");
  const { toast, showToast, hideToast } = useToast();

  const shouldShowScrollIndicator = (cards: CardModel[]) => {
    if (cards.length === 0) return false;
    const estimatedCardHeight = 140;
    const containerHeight = 380;
    const totalCardsHeight = cards.length * estimatedCardHeight;
    return totalCardsHeight > containerHeight;
  };

  const board: BoardModel | undefined = data;

  React.useEffect(() => {
    if (board) {
      setColumns(board.columns);
    }
  }, [board]);

  const handleBoardSelect = (board: BoardModel) => {
    if (selectedTeam) {
      setSelectedBoard(selectedTeam, board._id!);
      setBoardSelectorVisible(false);
    }
  };

  const handleManageBoards = () => {
    router.push("/boards");
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>User not authenticated</Text>
      </View>
    );
  }

  if (!selectedTeam) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF9500" />
        <Text style={styles.errorText}>No team selected</Text>
        <Text style={styles.infoText}>
          Please select a team to view its board
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/teams")}
        >
          <Ionicons name="people" size={20} color="white" />
          <Text style={styles.actionButtonText}>Go to Teams</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>
          Loading board for team: {selectedTeam}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading board</Text>
        <Text style={styles.infoText}>{error.message}</Text>
      </View>
    );
  }

  if (!board || !columns.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          No board found for team: {selectedTeam}
        </Text>
        <Text style={styles.infoText}>Try creating a new board</Text>
      </View>
    );
  }

  const onReceiveDragDrop = (event: any, destinationColumnTitle: string) => {
    const draggedCard: CardModel = event.dragged.payload;

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card._id !== draggedCard._id),
      }));

      const updatedColumns = newColumns.map((column) => {
        if (column.title === destinationColumnTitle) {
          return {
            ...column,
            cards: [
              ...column.cards,
              { ...draggedCard, columnTitle: destinationColumnTitle },
            ],
          };
        }
        return column;
      });

      if (board) {
        const updatedBoard = { ...board, columns: updatedColumns };
        updateBoardMutation.mutate(updatedBoard);
      }

      return updatedColumns;
    });
  };

  const handleAddCard = async (
    title: string,
    description: string,
    storyPoint: number,
    assignee: string,
    priority: "LOW" | "MEDIUM" | "HIGH",
  ) => {
    if (!board?._id) {
      console.error("No board selected.");
      return;
    }

    try {
      const new_card = await addCard({
        title,
        description,
        columnTitle: activeColumn,
        storyPoint,
        assignee,
        boardId: board._id,
        priority,
      });
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => {
          if (column.title === activeColumn) {
            return {
              ...column,
              cards: [...column.cards, new_card],
            };
          }
          return column;
        });

        return newColumns;
      });
    } catch (error) {
      console.error("Failed to add card: ", error);
    }
  };

  const openAddCardModal = (columnTitle: string) => {
    setActiveColumn(columnTitle);
    setShowModal(true);
  };

  const confirmDeleteCard = (
    cardId: string,
    columnTitle: string,
    cardTitle: string,
  ) => {
    setCardToDelete({ id: cardId, columnTitle, title: cardTitle });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (cardToDelete) {
      handleDeleteCard(cardToDelete.id, cardToDelete.columnTitle);
      setCardToDelete(null);
    }
  };

  const handleDeleteCard = async (cardId: string, columnTitle: string) => {
    if (!board?._id) {
      console.error("No board selected.");
      return;
    }

    try {
      await deleteCard({
        cardId,
        columnName: columnTitle,
        boardId: board._id,
      });
      setColumns((prevColumns) =>
        prevColumns.map((column) => {
          if (column.title === columnTitle) {
            return {
              ...column,
              cards: column.cards.filter((card) => card._id !== cardId),
            };
          }
          return column;
        }),
      );
    } catch (error) {
      console.error("Failed to delete card:", error);
    }
  };

  const handleEditCard = async (
    title: string,
    description: string,
    storyPoint: number,
    assignee: string,
    priority: "LOW" | "MEDIUM" | "HIGH",
  ) => {
    if (!editingCard || !board?._id) return;

    try {
      await editCard({
        cardId: editingCard._id!,
        title: title,
        description: description,
        columnTitle: editingCard.columnTitle,
        storyPoint: storyPoint,
        assignee,
        boardId: board._id,
        priority,
      });

      setColumns((prevColumns) =>
        prevColumns.map((col) => {
          if (col.title !== editingCard.columnTitle) return col;

          const updatedCards = col.cards.map((card) =>
            card._id === editingCard._id
              ? {
                  ...card,
                  title: title,
                  description: description,
                  story_point: storyPoint,
                  assignee: assignee,
                  priority: priority,
                }
              : card,
          );

          return { ...col, cards: updatedCards };
        }),
      );

      setEditModalVisible(false);
      setEditingCard(null);
    } catch (error) {
      console.error("Failed to update card", error);
    }
  };

  return (
    <DraxProvider>
      <View style={styles.screen}>
        {/* Board Selector Header */}
        <View style={styles.boardHeader}>
          <TouchableOpacity
            style={styles.boardSelector}
            onPress={() => setBoardSelectorVisible(true)}
          >
            <View style={styles.boardInfo}>
              <Text style={styles.boardTitle}>
                {board?.board_name || "Select Board"}
              </Text>
              <Text style={styles.teamName}>{selectedTeam}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageBoardsButton}
            onPress={handleManageBoards}
          >
            <Ionicons name="settings" size={20} color="#007AFF" />
            <Text style={styles.manageBoardsText}>Manage</Text>
          </TouchableOpacity>
        </View>

        <AddCardModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddCard}
          columnTitle={activeColumn}
        />
        {editingCard && (
          <EditCardModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            card={editingCard}
            onSuccess={handleEditCard}
          />
        )}
        <ConfirmDeleteModal
          visible={deleteModalVisible}
          onClose={() => {
            setDeleteModalVisible(false);
            setCardToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          message={`Are you sure you want to delete "${cardToDelete?.title}"?`}
        />

        {/* Board Selector Modal */}
        <Modal
          visible={boardSelectorVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.boardSelectorModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Board</Text>
                <TouchableOpacity
                  onPress={() => setBoardSelectorVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.boardList}>
                {availableBoards?.map((boardItem) => (
                  <TouchableOpacity
                    key={boardItem._id}
                    style={[
                      styles.boardOption,
                      boardItem._id === board?._id &&
                        styles.selectedBoardOption,
                    ]}
                    onPress={() => handleBoardSelect(boardItem)}
                  >
                    <View style={styles.boardOptionContent}>
                      <Text
                        style={[
                          styles.boardOptionName,
                          boardItem._id === board?._id &&
                            styles.selectedBoardOptionName,
                        ]}
                      >
                        {boardItem.board_name}
                      </Text>
                      <Text style={styles.boardOptionStats}>
                        {boardItem.columns.reduce(
                          (total, col) => total + col.cards.length,
                          0,
                        )}{" "}
                        cards
                      </Text>
                    </View>
                    {boardItem._id === board?._id && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
        <View style={styles.board}>
          {columns
            .filter((col) => typeof col.title === "string")
            .map((col) => (
              <DraxView
                key={col.title as string}
                style={styles.column}
                receivingStyle={styles.receiving}
                onReceiveDragDrop={(event) =>
                  onReceiveDragDrop(event, col.title as string)
                }
                testID={`column-${col.title}`}
              >
                <Text style={styles.columnTitle}>{col.title}</Text>
                <ScrollView
                  style={styles.cardsContainer}
                  showsVerticalScrollIndicator={shouldShowScrollIndicator(
                    col.cards,
                  )}
                  nestedScrollEnabled={true}
                  indicatorStyle="black"
                  scrollIndicatorInsets={{ right: 0 }}
                >
                  {col.cards.map((card) => (
                    <DraxView
                      key={card._id}
                      style={styles.card}
                      draggingStyle={styles.dragging}
                      hoverDraggingStyle={styles.hoverDragging}
                      dragReleasedStyle={styles.dragging}
                      dragPayload={card}
                      longPressDelay={150}
                      receptive={false}
                      draggable
                    >
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          confirmDeleteCard(
                            card._id!,
                            col.title.toString(),
                            card.title,
                          )
                        }
                      >
                        <Text style={styles.deleteButtonText}>❌</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          setEditingCard({ ...card, columnTitle: col.title });
                          setEditModalVisible(true);
                        }}
                      >
                        <Text style={styles.editButtonText}>edit</Text>
                      </TouchableOpacity>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      {card.description && (
                        <Text style={styles.cardDescription}>
                          {card.description}
                        </Text>
                      )}
                      {card.assignee && (
                        <Text style={styles.assignee}>{card.assignee}</Text>
                      )}
                      {card.story_point !== undefined &&
                        card.story_point > 0 && (
                          <Text style={styles.storyPoint}>
                            Story Point: {card.story_point}
                          </Text>
                        )}
                      {card.priority && (
                        <Text
                          style={[
                            styles.priorityText,
                            card.priority === "HIGH"
                              ? styles.prHighText
                              : card.priority === "MEDIUM"
                                ? styles.prMedText
                                : styles.prLowText,
                          ]}
                        >
                          Priority: {card.priority}
                        </Text>
                      )}
                    </DraxView>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.addCardButton}
                  onPress={() => openAddCardModal(col.title.toString())}
                >
                  <Text style={styles.addCardButtonText}>+ Add Card</Text>
                </TouchableOpacity>
              </DraxView>
            ))}
        </View>
      </View>
    </DraxProvider>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 10,
  },
  boardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: UI_CONSTANTS.SPACING.MEDIUM,
    paddingHorizontal: UI_CONSTANTS.SPACING.LARGE,
    backgroundColor: UI_CONSTANTS.COLORS.CARD_BACKGROUND,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    marginBottom: UI_CONSTANTS.SPACING.MEDIUM,
    ...UI_CONSTANTS.SHADOW.CARD,
  },
  boardSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: UI_CONSTANTS.SPACING.SMALL,
    paddingHorizontal: UI_CONSTANTS.SPACING.MEDIUM,
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    marginRight: UI_CONSTANTS.SPACING.MEDIUM,
  },
  boardInfo: {
    flex: 1,
  },
  boardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: UI_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  teamName: {
    fontSize: 14,
    color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  manageBoardsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: UI_CONSTANTS.SPACING.SMALL,
    paddingHorizontal: UI_CONSTANTS.SPACING.MEDIUM,
    backgroundColor: "#F0F8FF",
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    gap: 6,
  },
  manageBoardsText: {
    fontSize: 14,
    fontWeight: "500",
    color: UI_CONSTANTS.COLORS.PRIMARY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: UI_CONSTANTS.MODAL.OVERLAY_BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
  },
  boardSelectorModal: {
    backgroundColor: UI_CONSTANTS.COLORS.CARD_BACKGROUND,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.LARGE,
    padding: UI_CONSTANTS.SPACING.XXLARGE,
    width: UI_CONSTANTS.MODAL.WIDTH,
    maxWidth: UI_CONSTANTS.MODAL.MAX_WIDTH,
    maxHeight: UI_CONSTANTS.MODAL.MAX_HEIGHT,
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
  boardList: {
    maxHeight: 300,
  },
  boardOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F2F2F7",
  },
  selectedBoardOption: {
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  boardOptionContent: {
    flex: 1,
  },
  boardOptionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  selectedBoardOptionName: {
    color: "#007AFF",
    fontWeight: "600",
  },
  boardOptionStats: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 10,
  },
  teamTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#d32f2f",
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 10,
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
  board: {
    flex: 1,
    flexDirection: "row",
    overflow: "visible",
  },
  column: {
    flex: 1,
    margin: 5,
    marginTop: 15,
    backgroundColor: "#e0e0e0",
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 0,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
    minHeight: 500,
    overflow: "visible",
    display: "flex",
    flexDirection: "column",
  },
  receiving: {
    backgroundColor: "#d1c4e9",
  },
  columnTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  cardsContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: "100%",
  },
  scrollIndicatorArea: {
    position: "absolute",
    right: 0,
    top: 50,
    bottom: 60,
    width: 3,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 1.5,
  },
  card: {
    marginRight: 10,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDescription: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
  dragging: {
    opacity: 0.2,
  },
  hoverDragging: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    width: width * 0.25,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  deleteButton: {
    position: "absolute",
    top: 4,
    right: 6,
    zIndex: 1,
    padding: 4,
  },
  editButton: {
    position: "absolute",
    bottom: 4,
    right: 6,
    zIndex: 1,
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
    color: "red",
  },
  editButtonText: {
    fontSize: 12,
    color: "grey",
  },
  storyPoint: {
    fontWeight: "bold",
    fontSize: 11,
    color: "#007AFF",
  },
  assignee: {
    fontWeight: "bold",
    fontSize: 11,
    color: "#35a152",
  },
  addCardButton: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    marginLeft: -10,
    marginBottom: -10,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
    alignSelf: "stretch",
  },
  addCardButtonText: {
    textAlign: "center",
    color: "#666",
    fontWeight: "500",
    fontSize: 16,
  },
  priorityText: {
    marginTop: 4,
    fontWeight: "700",
  },
  prLowText: { color: "#16a34a" },
  prMedText: { color: "#d97706" },
  prHighText: { color: "#dc2626" },
});

import { DraxProvider, DraxView, DraxScrollView } from "react-native-drax";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useBoard, useUpdateBoard } from "../hooks/useBoard";
import { BoardModel, CardModel, ColumnModel } from "../models/board";
import { AddCardModal } from "@/components/AddCardModal";
import { addCard, deleteCard, editCard } from "@/services/card";
import { useAuth } from "@/store/authStore";
import { EditCardModal } from "@/components/EditCardModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { UserFilterDropdown } from "@/components/UserFilterDropdown";
import { useToast } from "@/hooks/useToast";
import { isForbiddenError } from "@/services/api";
import { usePermission } from "@/hooks/usePermission";

const { width } = Dimensions.get("window");

const getStableCardKey = (card: CardModel) =>
  String(
    (card as any)._id ??
      (card as any).id ??
      (card as any).__tempId ??
      (card as any).card_id ??
      `${card.title}`,
  );

// Separate Card component to prevent unnecessary re-renders
const DraggableCard = React.memo(
  ({
    card,
    columnTitle,
    onDelete,
    onEdit,
  }: {
    card: CardModel;
    columnTitle: string;
    onDelete: (cardId: string, columnTitle: string, cardTitle: string) => void;
    onEdit: (card: CardModel, columnTitle: string) => void;
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const draxCardKey = getStableCardKey(card);

    return (
      <DraxView
        // Stable, unique ID
        id={`card-${draxCardKey}`}
        style={[styles.card, isDragging && styles.cardDraggingLocal]}
        draggingStyle={styles.dragging}
        hoverDraggingStyle={styles.hoverDragging}
        dragPayload={{ ...card, sourceColumnTitle: columnTitle }}
        longPressDelay={150}
        receptive={false}
        draggable={true}
        // Drag lifecycle callbacks to track state
        onDragStart={() => {
          setIsDragging(true);
        }}
        onDrag={() => {
          // Keep drag state active
          if (!isDragging) setIsDragging(true);
        }}
        onDragEnd={() => {
          setIsDragging(false);
        }}
        onDragDrop={() => {
          setIsDragging(false);
        }}
      >
        {card.card_id && (
          <View style={styles.cardIdContainer}>
            <Text style={styles.cardId}>{card.card_id}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(card._id!, columnTitle, card.title)}
          onPressIn={(e) => e.stopPropagation?.()}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>❌</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(card, columnTitle)}
          onPressIn={(e) => e.stopPropagation?.()}
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonText}>edit</Text>
        </TouchableOpacity>

        <Text style={[styles.cardTitle, { marginTop: 20 }]}>{card.title}</Text>
        {card.description && (
          <Text style={styles.cardDescription}>{card.description}</Text>
        )}
        {card.assignee && <Text style={styles.assignee}>{card.assignee}</Text>}
        {card.story_point !== undefined && card.story_point > 0 && (
          <Text style={styles.storyPoint}>Story Point: {card.story_point}</Text>
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
    );
  },
);

DraggableCard.displayName = "DraggableCard";

export const BoardScreen = () => {
  const router = useRouter();
  const { data, isLoading, error } = useBoard();
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const user = useAuth((state) => state.user);
  const setSelectedTeam = useAuth((state) => state.setSelectedTeam);
  const { canAccessTeam } = usePermission();

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

  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedUserFilters, setSelectedUserFilters] = useState<string[]>([]);

  const [draxKey, setDraxKey] = useState(0);

  const { showToast } = useToast();

  const bumpDraxKey = useCallback(() => {
    setDraxKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (selectedTeam && !canAccessTeam(selectedTeam)) {
      setSelectedTeam(undefined);
      router.replace("/teams");
    }
  }, [selectedTeam, canAccessTeam, setSelectedTeam, router]);

  useEffect(() => {
    if (error && isForbiddenError(error)) {
      showToast("Access denied to this board", "error");
      router.replace("/boards");
    }
  }, [error, showToast, router]);

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
      bumpDraxKey();
    }
  }, [board, bumpDraxKey]);

  const { availableUsers, hasUnassignedCards } = useMemo(() => {
    const users = new Set<string>();
    let hasUnassigned = false;
    columns.forEach((col) => {
      col.cards.forEach((card) => {
        if (card.assignee) {
          users.add(card.assignee);
        } else {
          hasUnassigned = true;
        }
      });
    });
    return {
      availableUsers: Array.from(users).sort(),
      hasUnassignedCards: hasUnassigned,
    };
  }, [columns]);

  const filteredColumns = useMemo(() => {
    if (selectedUserFilters.length === 0) {
      return columns;
    }

    return columns.map((col) => ({
      ...col,
      cards: col.cards.filter((card) => {
        // Check if "Unassigned" filter is selected
        if (selectedUserFilters.includes("__unassigned__") && !card.assignee) {
          return true;
        }
        // Check if card's assignee matches selected users
        return card.assignee
          ? selectedUserFilters.includes(card.assignee)
          : false;
      }),
    }));
  }, [columns, selectedUserFilters]);

  const handleToggleUser = (username: string) => {
    setSelectedUserFilters((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username],
    );
  };

  const handleClearFilter = () => {
    setSelectedUserFilters([]);
    setFilterDropdownOpen(false);
  };

  // Memoized callbacks to prevent recreation
  const handleCardDelete = useCallback(
    (cardId: string, columnTitle: string, cardTitle: string) => {
      setCardToDelete({ id: cardId, columnTitle, title: cardTitle });
      setDeleteModalVisible(true);
    },
    [],
  );

  const handleCardEdit = useCallback((card: CardModel, columnTitle: string) => {
    setEditingCard({ ...card, columnTitle });
    setEditModalVisible(true);
  }, []);

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
        <Ionicons name="clipboard-outline" size={64} color="#FF9500" />
        <Text style={styles.errorText}>
          No board found for team: {selectedTeam}
        </Text>
        <Text style={styles.infoText}>
          Please select a board from the boards screen
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/boards")}
        >
          <Ionicons name="grid" size={20} color="white" />
          <Text style={styles.actionButtonText}>Go to Boards</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const onReceiveDragDrop = (event: any, destinationColumnTitle: string) => {
    const draggedCard: CardModel = event.dragged.payload;
    const draggedKey = getStableCardKey(draggedCard);

    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((column) => ({
        ...column,
        cards: column.cards.filter(
          (card) => getStableCardKey(card) !== draggedKey,
        ),
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
      showToast("No board selected", "error");
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
      //  ensure new cards have a stable unique id even if _id is briefly missing
      const normalizedNewCard = (new_card as any)._id
        ? new_card
        : {
            ...(new_card as any),
            __tempId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          };

      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => {
          if (column.title === activeColumn) {
            return {
              ...column,
              cards: [...column.cards, normalizedNewCard as any],
            };
          }
          return column;
        });

        return newColumns;
      });

      setTimeout(bumpDraxKey, 0);
    } catch (error) {
      console.error("Failed to add card: ", error);
    }
  };

  const openAddCardModal = (columnTitle: string) => {
    setActiveColumn(columnTitle);
    setShowModal(true);
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

      setTimeout(bumpDraxKey, 0);
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
    <DraxProvider key={`drax-${draxKey}`}>
      <View style={styles.screen}>
        <UserFilterDropdown
          availableUsers={availableUsers}
          selectedUsers={selectedUserFilters}
          onToggleUser={handleToggleUser}
          onClearFilter={handleClearFilter}
          isOpen={filterDropdownOpen}
          onToggle={() => setFilterDropdownOpen(!filterDropdownOpen)}
          hasUnassignedCards={hasUnassignedCards}
        />
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

        <View style={styles.board}>
          {filteredColumns
            .filter((col) => typeof col.title === "string")
            .map((col) => (
              <DraxView
                key={`column-${col.title}`}
                id={`column-${col.title}`}
                style={styles.column}
                receivingStyle={styles.receiving}
                onReceiveDragDrop={(event) =>
                  onReceiveDragDrop(event, col.title as string)
                }
                receptive={true}
                testID={`column-${col.title}`}
              >
                <Text style={styles.columnTitle}>{col.title}</Text>
                <DraxScrollView
                  style={styles.cardsContainer}
                  showsVerticalScrollIndicator={shouldShowScrollIndicator(
                    col.cards,
                  )}
                  nestedScrollEnabled={true}
                  indicatorStyle="black"
                  scrollIndicatorInsets={{ right: 0 }}
                  scrollEventThrottle={16}
                  keyboardShouldPersistTaps="handled"
                >
                  {col.cards.map((card) => {
                    const cardKey = getStableCardKey(card);

                    return (
                      <DraggableCard
                        key={`card-${cardKey}`}
                        card={card}
                        columnTitle={col.title as string}
                        onDelete={handleCardDelete}
                        onEdit={handleCardEdit}
                      />
                    );
                  })}
                </DraxScrollView>

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
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardDraggingLocal: {
    borderColor: "#007AFF",
    backgroundColor: "#f8f9ff",
  },
  dragHandleText: {
    color: "#999",
    fontSize: 10,
    letterSpacing: 2,
  },
  cardIdContainer: {
    position: "absolute",
    top: 6,
    left: 8,
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#B3D9F2",
    zIndex: 1,
  },
  cardId: {
    fontSize: 10,
    color: "#0066CC",
    fontWeight: "700",
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

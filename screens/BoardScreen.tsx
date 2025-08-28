import { DraxProvider, DraxView } from "react-native-drax";
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
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

const { width } = Dimensions.get("window");

export const BoardScreen = () => {
  const router = useRouter();
  const { data, isLoading, error } = useBoard();
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const user = useAuth((state) => state.user);
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
  ) => {
    if (!selectedTeam) {
      console.error("No team selected.");
      return;
    }

    try {
      const new_card = await addCard({
        title,
        description,
        columnTitle: activeColumn,
        storyPoint,
        team: selectedTeam,
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
    if (!selectedTeam) {
      console.error("No team selected.");
      return;
    }

    try {
      await deleteCard({
        cardId,
        columnName: columnTitle,
        team: selectedTeam,
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
  ) => {
    if (!editingCard || !selectedTeam) return;

    try {
      await editCard({
        cardId: editingCard._id!,
        title: title,
        description: description,
        columnTitle: editingCard.columnTitle,
        storyPoint: storyPoint,
        team: selectedTeam,
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
                      <Text
                        style={styles.deleteButton}
                        onPress={() =>
                          confirmDeleteCard(
                            card._id!,
                            col.title.toString(),
                            card.title,
                          )
                        }
                      >
                        ❌
                      </Text>
                      <Text
                        style={styles.editButton}
                        onPress={() => {
                          setEditingCard({ ...card, columnTitle: col.title });
                          setEditModalVisible(true);
                        }}
                      >
                        edit
                      </Text>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      {card.description && (
                        <Text style={styles.cardDescription}>
                          {card.description}
                        </Text>
                      )}
                      {card.assignee && <Text>Assignee: {card.assignee}</Text>}
                      {card.story_point !== undefined &&
                        card.story_point > 0 && (
                          <Text style={styles.storyPoint}>
                            Story Point: {card.story_point}
                          </Text>
                        )}
                      {card.priority && <Text>Priority: {card.priority}</Text>}
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
    fontSize: 16,
    color: "red",
    zIndex: 1,
  },
  editButton: {
    position: "absolute",
    bottom: 4,
    right: 6,
    fontSize: 12,
    color: "grey",
    zIndex: 1,
  },
  storyPoint: {
    fontWeight: "bold",
    fontSize: 11,
    color: "#007AFF",
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
});

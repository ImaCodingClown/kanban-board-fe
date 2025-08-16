import { DraxProvider, DraxView } from "react-native-drax";
import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useBoard, useUpdateBoard } from "../hooks/useBoard";
import { BoardModel, CardModel, ColumnModel } from "../models/board";
import { AddCardModal } from "@/components/AddCardModal";
import { addCard, deleteCard, editCard } from "@/services/card";
import { useAuth } from "@/store/authStore";
import { EditCardModal } from "@/components/EditCardModal";

const { width } = Dimensions.get("window");

export const BoardScreen = () => {
  const { data, isLoading, error } = useBoard();
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const user = useAuth((state) => state.user);
  const [columns, setColumns] = useState<ColumnModel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const updateBoardMutation = useUpdateBoard();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<
    (CardModel & { columnTitle: string }) | null
  >(null);

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
        <Text style={styles.errorText}>No team selected</Text>
        <Text style={styles.infoText}>Please select a team from the navigation bar</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading board for team: {selectedTeam}</Text>
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
        <Text style={styles.errorText}>No board found for team: {selectedTeam}</Text>
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
    columnTitle: string,
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
        columnTitle,
        storyPoint,
        team: selectedTeam,
      });
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => {
          if (column.title === columnTitle) {
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
        <View style={styles.header}>
          <Text style={styles.teamTitle}>Team: {selectedTeam}</Text>
        </View>
        
        <AddCardModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddCard}
        />
        {editingCard && (
          <EditCardModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            card={editingCard}
            onSuccess={handleEditCard}
          />
        )}
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
                        handleDeleteCard(card._id!, col.title.toString())
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
                      <Text style={styles.cardDescription}>{card.description}</Text>
                    )}
                    {card.assignee && <Text>Assignee: {card.assignee}</Text>}
                    {card.story_point !== undefined && card.story_point > 0 && (
                      <Text style={styles.storyPoint}>
                        Story Point: {card.story_point}
                      </Text>
                    )}
                    {card.priority && <Text>Priority: {card.priority}</Text>}
                  </DraxView>
                ))}
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
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  board: {
    flex: 1,
    flexDirection: "row",
    overflow: "visible",
  },
  column: {
    flex: 1,
    margin: 5,
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 10,
    minHeight: 500,
    overflow: "visible",
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
  card: {
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
});
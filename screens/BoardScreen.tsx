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
  const { data, isLoading } = useBoard();
  const [columns, setColumns] = useState<ColumnModel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const updateBoardMutation = useUpdateBoard();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState<
    (CardModel & { columnTitle: string }) | null
  >(null);

  const board: BoardModel | undefined = data;

  React.useEffect(() => {
    const controller = new AbortController();

    if (board) {
      setColumns(board.columns);
    }

    return () => controller.abort();
  }, [board]);

  if (isLoading) return <Text>Loading board...</Text>;

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
    const team = useAuth.getState().user?.teams?.[0];

    if (!team) {
      console.error("No team found for the user.");
      return;
    }

    console.log("handleAddCard hit");

    try {
      const new_card = await addCard({
        title,
        description,
        columnTitle,
        storyPoint,
        team,
      });
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => {
          if (column.title === columnTitle) {
            return {
              ...column,
              cards: [...column.cards, new_card], // immutably add new_card
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
    const team = useAuth.getState().user?.teams?.[0];

    if (!team) {
      console.error("No team found for the user.");
      return;
    }

    try {
      await deleteCard({
        cardId,
        columnName: columnTitle,
        team,
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
    
  const handleEditCard = async (title: string, description: string) => {
    if (!editingCard) return;

    const team = useAuth.getState().user?.teams?.[0];
    if (!team) return;

    try {
      await editCard({
        cardId: editingCard._id!,
        title: title,
        description: description,
        columnTitle: editingCard.columnTitle,
        storyPoint: storyPoint,
        team,
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
                    receptive={false} // Important so card itself doesn't act like a drop target
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
                    <Text>{card.title}</Text>
                    {card.description && <Text>{card.description}</Text>}
                    {card.assignee && <Text>Assignee: {card.assignee}</Text>}
                    {card.story_point !== undefined && card.story_point > 0 && (
                      <Text>
                        <Text style={styles.storyPoint}>
                          Story Point: {card.story_point}
                        </Text>
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
  board: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
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
  screen: {
    flex: 1,
    padding: 10,
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
    fontSize: 16,
    color: "grey",
    zIndex: 1,
  },
  storyPoint: {
    fontWeight: "bold",
    fontSize: 11,
  },
});

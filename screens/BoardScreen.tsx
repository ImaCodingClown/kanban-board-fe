import { DraxProvider, DraxView } from "react-native-drax";
import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useBoard } from "../hooks/useBoard";
import { CardModel, ColumnModel } from "../models/board";
import { AddCardModal } from "@/components/AddCardModal";
import { addCard } from "@/services/card";
import { useAuth } from "@/store/authStore";

const { width } = Dimensions.get("window");

// A simple utility to generate temporary unique IDs
const generateTempId = () =>
  `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const BoardScreen = () => {
  const { data, isLoading } = useBoard();
  const [columns, setColumns] = useState<ColumnModel[]>([]);
  const [showModal, setShowModal] = useState(false);

  const board: ColumnModel[] | undefined = data;

  React.useEffect(() => {
    if (board) {
      const boardWithIds = board.map((col) => ({
        ...col,
        cards: col.cards.map((card) => ({
          ...card,
          id: card.id || generateTempId(),
        })),
      }));
      setColumns(boardWithIds);
    }
  }, [board]);

  if (isLoading) return <Text>Loading board...</Text>;

  const onReceiveDragDrop = (event: any, destinationColumnTitle: string) => {
    const draggedCardId = event.dragged.payload;

    setColumns((prevColumns) => {
      const newColumns: ColumnModel[] = JSON.parse(JSON.stringify(prevColumns));

      let sourceColumnIndex = -1;
      let draggedCardIndex = -1;

      for (let i = 0; i < newColumns.length; i++) {
        const cardIndex = newColumns[i].cards.findIndex(
          (card) => card.id === draggedCardId
        );
        if (cardIndex !== -1) {
          sourceColumnIndex = i;
          draggedCardIndex = cardIndex;
          break;
        }
      }

      if (sourceColumnIndex === -1) {
        return prevColumns;
      }

      const destinationColumnIndex = newColumns.findIndex(
        (col) => col.title === destinationColumnTitle
      );

      if (
        destinationColumnIndex === -1 ||
        sourceColumnIndex === destinationColumnIndex
      ) {
        return prevColumns;
      }

      const [cardToMove] = newColumns[sourceColumnIndex].cards.splice(
        draggedCardIndex,
        1
      );

      if (cardToMove) {
        newColumns[destinationColumnIndex].cards.push(cardToMove);
      }

      return newColumns;
    });
  };

  const handleAddCard = async (
    title: string,
    description: string,
    columnTitle: string
  ) => {
    const team = useAuth.getState().user?.teams?.[0];

    if (!team) {
      console.error("No team found for the user.");
      return;
    }

    try {
      const newCard = await addCard({ title, description, columnTitle, team });

      if (!newCard.id) {
        newCard.id = generateTempId();
      }

      setColumns((prev) => {
        const newColumns = [...prev];
        const columnIndex = newColumns.findIndex(
          (col) => col.title === columnTitle
        );
        if (columnIndex > -1) {
          newColumns[columnIndex].cards.push(newCard);
        }
        return newColumns;
      });
    } catch (error) {
      console.error("Failed to add card: ", error);
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
        <View style={styles.board}>
          {columns
            .filter((col) => typeof col.title === "string")
            .map((col, index) => (
              <DraxView
                key={`${col.title}-${index}`}
                style={styles.column}
                receivingStyle={styles.receiving}
                onReceiveDragDrop={(event) =>
                  onReceiveDragDrop(event, col.title as string)
                }
                testID={`column-${col.title}`}
              >
                <Text style={styles.columnTitle}>{col.title}</Text>
                {col.cards.map((card, cardIndex) => (
                  <DraxView
                    key={card.id || `card-${cardIndex}`}
                    style={styles.card}
                    draggingStyle={styles.dragging}
                    hoverDraggingStyle={styles.hoverDragging}
                    dragReleasedStyle={styles.dragging}
                    dragPayload={card.id}
                    longPressDelay={150}
                    receptive={false}
                    draggable
                  >
                    <Text>{card.title}</Text>
                    {card.description && <Text>{card.description}</Text>}
                    {card.assignee && <Text>Assignee: {card.assignee}</Text>}
                    {card.storyPoints && (
                      <Text>Story Points: {card.storyPoints}</Text>
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
});

import { DraxProvider, DraxView } from "react-native-drax";
import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useBoard } from "../hooks/useBoard";
import { CardModel, ColumnModel } from "../models/board";
import { AddCardModal } from "@/components/AddCardModal";
import { addCard } from "@/services/card";
import { useAuth } from "@/store/authStore";

const { width } = Dimensions.get("window");

export enum Priority {
  High = "high",
  Medium = "medium",
  Low = "low",
  None = "none",
}

export const BoardScreen = () => {
  const { data, isLoading } = useBoard();

  const [cards, setCards] = useState<(CardModel & { columnTitle: string })[]>(
    [],
  );
  const [columns, setColumns] = useState<ColumnModel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>(
    Priority.None,
  );

  const board: ColumnModel[] | undefined = data;

  React.useEffect(() => {
    if (board) {
      setColumns(board);
      const allCards = board.flatMap((col) =>
        col.cards.map((card) => ({
          ...card,
          columnTitle: col.title,
        })),
      );
      setCards(allCards);
    }
  }, [board]);

  if (isLoading) return <Text>Loading board...</Text>;

  const onReceiveDragDrop = (event: any, destinationColumnTitle: string) => {
    const draggedCardId = event.dragged.payload;
    setCards((prev) =>
      prev.map((card) =>
        card.id === draggedCardId
          ? { ...card, columnTitle: destinationColumnTitle }
          : card,
      ),
    );
  };

  const handleAddCard = async (
    title: string,
    description: string,
    columnTitle: string,
  ) => {
    const team = useAuth.getState().user?.teams?.[0];
    if (!team) return;

    try {
      const newCard = await addCard({ title, description, columnTitle, team });
      setCards((prev) => [...prev, { ...newCard, columnTitle }]);
    } catch (error) {
      console.error("Failed to add card:", error);
    }
  };

  const filteredCards = cards.filter((card) => {
    if (selectedPriority === Priority.None) return true;
    return card.priority === selectedPriority;
  });

  return (
    <DraxProvider>
      <View style={styles.screen}>
        <AddCardModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddCard}
        />

        <View style={styles.filterContainer}>
          <View style={styles.pickerWrapper}>
            <Ionicons name="flag" size={16} color="#007AFF" />
            <Picker
              selectedValue={selectedPriority}
              onValueChange={(value) => setSelectedPriority(value as Priority)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Priority" value={Priority.None} />
              <Picker.Item label="High" value={Priority.High} />
              <Picker.Item label="Medium" value={Priority.Medium} />
              <Picker.Item label="Low" value={Priority.Low} />
            </Picker>
          </View>
        </View>

        <View style={styles.board}>
          {columns.map((col) => (
            <DraxView
              key={col.title}
              style={styles.column}
              receivingStyle={styles.receiving}
              onReceiveDragDrop={(event) => onReceiveDragDrop(event, col.title)}
            >
              <Text style={styles.columnTitle}>{col.title}</Text>

              {filteredCards
                .filter((card) => card.columnTitle === col.title)
                .map((card) => (
                  <DraxView
                    key={card.id}
                    style={styles.card}
                    draggingStyle={styles.dragging}
                    hoverDraggingStyle={styles.hoverDragging}
                    dragPayload={card.id}
                    longPressDelay={150}
                    draggable
                  >
                    <Text>{card.title}</Text>
                    {card.description && <Text>{card.description}</Text>}
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
  },
  column: {
    flex: 1,
    margin: 5,
    backgroundColor: "#e0e0e0",
    padding: 10,
    borderRadius: 10,
    minHeight: 500,
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
    backgroundColor: "#fff",
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
  },
  screen: {
    flex: 1,
    padding: 10,
  },
  filterContainer: {
    marginBottom: 20,
  },
  pickerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 8,
    paddingLeft: 8,
  },
  picker: {
    width: 150,
    color: "#007AFF",
  },
});

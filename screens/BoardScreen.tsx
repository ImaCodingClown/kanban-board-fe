import { DraxProvider, DraxView } from 'react-native-drax';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useBoard } from '../hooks/useBoard';

const { width } = Dimensions.get('window');

export const BoardScreen = () => {
  const { data, isLoading } = useBoard();
  const [cards, setCards] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const board = data?.board;
  React.useEffect(() => {
    if (board) {
      setColumns(board);
      const allCards = board.flatMap((col: any) =>
        col.cards.map((card: any) => ({
          ...card,
          columnId: col.id,
        }))
      );
      setCards(allCards);
    }
  }, [board]);

  if (isLoading) return <Text>Loading...</Text>;

  const onReceiveDragDrop = (event: any, destinationColumnId: string) => {
    const draggedCardId = event.dragged.payload;
    setCards(prev =>
      prev.map(card =>
        card.id === draggedCardId ? { ...card, columnId: destinationColumnId } : card
      )
    );
  };

  return (
    <DraxProvider>
      <View style={styles.board}>
        {columns.map(col => (
          <DraxView
            key={col.id}
            style={styles.column}
            receivingStyle={styles.receiving}
            onReceiveDragDrop={event => onReceiveDragDrop(event, col.id)}
          >
            <Text style={styles.columnTitle}>{col.title}</Text>
            {cards
              .filter(card => card.columnId === col.id)
              .map(card => (
                <DraxView
                  key={card.id}
                  style={styles.card}
                  draggingStyle={styles.dragging}
                  hoverDraggingStyle={styles.hoverDragging}
                  dragReleasedStyle={styles.dragging}
                  dragPayload={card.id}
                  longPressDelay={150}
                  receptive={false} // Important so card itself doesn't act like a drop target
                  draggable
                >
                  <Text>{card.title}</Text>
                </DraxView>
              ))}
          </DraxView>
        ))}
      </View>
    </DraxProvider>
  );
};

const styles = StyleSheet.create({
  board: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    overflow: 'visible',
  },
  column: {
    flex: 1,
    margin: 5,
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 10,
    minHeight: 500,
    overflow: 'visible',
  },
  receiving: {
    backgroundColor: '#d1c4e9',
  },
  columnTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginBottom: 10,
  },
  dragging: {
    opacity: 0.2,
  },
  hoverDragging: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    width: width * 0.25,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});


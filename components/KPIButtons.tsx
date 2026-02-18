import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ColumnModel } from "@/models/board";

type Props = {
  columns: ColumnModel[];
  selectedUsers: string[];
};

export const KPIButtons = ({ columns, selectedUsers }: Props) => {
  // Calculate story points per column
  const calculateColumnPoints = () => {
    const columnPoints: Record<string, number> = {};

    columns.forEach((column) => {
      const columnTitle = column.title as string;
      columnPoints[columnTitle] = 0;

      column.cards.forEach((card) => {
        // If users are selected, only count cards for those users
        if (selectedUsers.length > 0) {
          const isUnassignedSelected = selectedUsers.includes("__unassigned__");
          const matchesFilter =
            (isUnassignedSelected && !card.assignee) ||
            (card.assignee && selectedUsers.includes(card.assignee));

          if (matchesFilter) {
            columnPoints[columnTitle] += card.story_point || 0;
          }
        } else {
          // No filter - count all cards
          columnPoints[columnTitle] += card.story_point || 0;
        }
      });
    });

    return columnPoints;
  };

  const columnPoints = calculateColumnPoints();

  // Define the three columns we want to display
  const displayColumns = ["To Do", "In Progress", "Done"];

  return (
    <View style={styles.container}>
      {displayColumns.map((columnName) => {
        const points = columnPoints[columnName] || 0;

        return (
          <View key={columnName} style={styles.button}>
            <Text style={styles.buttonText}>
              {columnName}: {points} {points === 1 ? "Point" : "Points"}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 35,
    width: 160,
  },
  buttonText: {
    color: "#007AFF",
    fontSize: 11,
    fontWeight: "600",
  },
});

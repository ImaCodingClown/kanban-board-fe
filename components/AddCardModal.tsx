import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet, Pressable } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, storyPoint: number) => void;
  columnTitle: string;
};

export const AddCardModal = ({ visible, onClose, onSubmit }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyPoint, setStoryPoint] = useState<number>(0);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // safety, ensure storypoint is a number
    const storyPointNumber = typeof storyPoint === "string" ? parseInt(storyPoint, 10) : storyPoint;

    try {
      onSubmit(title, description, storyPoint);
      setTitle("");
      setDescription("");
      setStoryPoint(0);
      onClose();
    } catch (error) {
      console.error("Error adding card:", error);
      alert("Failed to add card.");
    }
  };

  // Fibonacci values shown as chips
  const FIB = [1, 2, 3, 5, 8, 13, 21];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text>Add Card</Text>
          <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
          <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
          <Text style={{ marginTop: 10 }}>Story Points:</Text>
          <View style={styles.spShell}>
            <View style={styles.spRow}>
              {FIB.map((opt) => {
                const active = storyPoint === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setStoryPoint(opt)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[styles.spChip, active ? styles.spChipActive : styles.spChipDefault]}
                  >
                    <Text style={active ? styles.spTextActive : styles.spTextDefault}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Button title="Add Card" onPress={handleSubmit} />
          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000088",
  },
  modal: { margin: 20, padding: 20, backgroundColor: "#fff", borderRadius: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 6,
    borderRadius: 4,
  },
  spShell: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginTop: 6,
    marginBottom: 10,
  },
  spRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  spChip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spChipDefault: { backgroundColor: "#fff", borderColor: "#e5e5e5" },
  spChipActive: { backgroundColor: "#2563eb", borderColor: "#1d4ed8" },
  spTextDefault: { color: "#111827", fontWeight: "600" },
  spTextActive: { color: "#fff", fontWeight: "700" },
});

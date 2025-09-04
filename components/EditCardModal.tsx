import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useAuth } from "@/store/authStore";
import { CardModel } from "../models/board";
import { editCard } from "@/services/card";
import { Pressable } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  card: CardModel & { columnTitle: string };
  onSuccess?: (title: string, description: string, storyPoint: number) => void;
};

export const EditCardModal = ({ visible, onClose, card, onSuccess }: Props) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [storyPoint, setStoryPoint] = useState<number>(card.story_point ?? 0);

  const team = useAuth.getState().user?.teams?.[0];

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
      setStoryPoint(card.story_point ?? 0);
    }
  }, [card]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // safety
    const storyPointNumber = typeof storyPoint === "string" ? parseInt(storyPoint, 10) : storyPoint;

    try {
      await editCard({
        cardId: card._id!,
        title,
        description,
        columnTitle: card.columnTitle,
        storyPoint,
        team: team!,
      });

      onSuccess?.(title, description, storyPoint);
      onClose();
    } catch (error) {
      console.error("Failed to edit card:", error);
      alert("Error editing card.");
    }
  };

  const FIB = [1, 2, 3, 5, 8, 13, 21];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text>Edit Card</Text>
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
          <Button title="Save Changes" onPress={handleSubmit} />
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
  modal: {
    margin: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
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

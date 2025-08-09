import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useAuth } from "@/store/authStore";
import { CardModel } from "../models/board";
import { editCard } from "@/services/card";
import { Picker } from "@react-native-picker/picker";

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
      setStoryPoint(card.story_point ?? 0);
    }
  }, [card]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // safety
    const storyPointNumber =
      typeof storyPoint === "string" ? parseInt(storyPoint, 10) : storyPoint;

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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text>Edit Card</Text>
          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
          />
          <Text style={{ marginTop: 10 }}>Story Points:</Text>
          <Picker
            selectedValue={storyPoint}
            onValueChange={(value) => {
              const numValue =
                typeof value === "string" ? parseInt(value, 10) : value;
              setStoryPoint(numValue);
            }}
            style={styles.picker}
          >
            {[...Array(10).keys()].map((num) => (
              <Picker.Item key={num} label={num.toString()} value={num} />
            ))}
          </Picker>
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
  picker: {
    marginVertical: 13,
    backgroundColor: "#f2f2f2",
  },
});

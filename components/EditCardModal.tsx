import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useAuth } from "@/store/authStore";
import { CardModel } from "../models/board";
import { editCard } from "@/services/card";

type Props = {
  visible: boolean;
  onClose: () => void;
  card: CardModel & { columnTitle: string };
  onSuccess?: (title: string, description: string) => void;
};

export const EditCardModal = ({ visible, onClose, card, onSuccess }: Props) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");

  const team = useAuth.getState().user?.teams?.[0];

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
    }
  }, [card]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      await editCard({
        cardId: card._id!,
        title,
        description,
        columnTitle: card.columnTitle,
        team: team!,
      });

      onSuccess?.(title, description);
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
});

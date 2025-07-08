import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ColumnModel } from "../models/board";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, columnId: string) => void;
  columns: ColumnModel[];
};

export const AddCardModal = ({
  visible,
  onClose,
  onSubmit,
  columns,
}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnTitle, setColumnTitle] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      await onSubmit(title, description, columnTitle); // ✅ Await the backend call
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error adding card:", error);
      alert("Failed to add card.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text>Add Card</Text>
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
          {/* Column picker */}
          <Text style={{ marginTop: 10 }}>Add to column:</Text>
          <Picker
            selectedValue={columnTitle}
            onValueChange={(itemValue: string) => setColumnTitle(itemValue)}
            style={styles.picker}
          >
            {(columns ?? []).map((col) => (
              <Picker.Item
                key={col.title}
                label={col.title}
                value={col.title}
              />
            ))}
          </Picker>
          <Button title="Submit" onPress={handleSubmit} />
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
  picker: {
    marginVertical: 13,
    backgroundColor: "#f2f2f2",
  },
});

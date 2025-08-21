import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

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
    const storyPointNumber =
      typeof storyPoint === "string" ? parseInt(storyPoint, 10) : storyPoint;

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
          <Text style={{ marginTop: 10 }}>Story Point:</Text>
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
  picker: {
    marginVertical: 10,
    backgroundColor: "#f2f2f2",
  },
});

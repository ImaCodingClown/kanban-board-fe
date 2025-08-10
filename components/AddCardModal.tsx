import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ColumnModel } from "../models/board";
import { useAuth } from "@/store/authStore";
import { getColumns } from "@/services/card";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string,
    columeTitle: string,
    storyPoint: number,
  ) => void;
};

export const AddCardModal = ({ visible, onClose, onSubmit }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnTitle, setColumnTitle] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [storyPoint, setStoryPoint] = useState<number>(0);

  const team = useAuth.getState().user?.teams?.[0];

  useEffect(() => {
    const fetchColumns = async () => {
      if (!team) {
        console.warn("No team assigned to user");
        return;
      }

      try {
        const data = await getColumns(team);
        setColumns(data);
        if (data.length > 0) setColumnTitle(data[0]);
      } catch (error) {
        console.error("Failed to fetch columns: ", error);
      }
    };

    if (visible) fetchColumns();
  }, [visible]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    // safety, ensure storypoint is a number
    const storyPointNumber =
      typeof storyPoint === "string" ? parseInt(storyPoint, 10) : storyPoint;

    try {
      onSubmit(title, description, columnTitle, storyPoint);
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
          {/* Column picker */}
          <Text style={{ marginTop: 10 }}>Add to column:</Text>
          <Picker
            selectedValue={columnTitle}
            onValueChange={(itemValue: string) => setColumnTitle(itemValue)}
            style={styles.picker}
          >
            {(columns ?? []).map((col) => (
              <Picker.Item key={col} label={col} value={col} />
            ))}
          </Picker>

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
    marginVertical: 10,
    backgroundColor: "#f2f2f2",
  },
});

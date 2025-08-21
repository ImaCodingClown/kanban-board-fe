import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
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

  const selectedTeam = useAuth((state) => state.selectedTeam);

  useEffect(() => {
    const fetchColumns = async () => {
      if (!selectedTeam) {
        console.warn("No team selected");
        return;
      }

      try {
        const data = await getColumns(selectedTeam);
        setColumns(data);
        if (data.length > 0) setColumnTitle(data[0]);
      } catch (error) {
        console.error("Failed to fetch columns: ", error);
      }
    };

    if (visible) fetchColumns();
  }, [visible, selectedTeam]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const storyPointNumber =
      typeof storyPoint === "string" ? parseInt(storyPoint, 10) : storyPoint;

    try {
      onSubmit(title, description, columnTitle, storyPointNumber);
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
          <Text style={styles.title}>Add Card</Text>
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
            multiline
          />
          <Text style={styles.label}>Add to column:</Text>
          <Picker
            selectedValue={columnTitle}
            onValueChange={(itemValue: string) => setColumnTitle(itemValue)}
            style={styles.picker}
          >
            {(columns ?? []).map((col) => (
              <Picker.Item key={col} label={col} value={col} />
            ))}
          </Picker>

          <Text style={styles.label}>Story Point:</Text>
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
          
          <View style={styles.buttonContainer}>
            <Button title="Submit" onPress={handleSubmit} />
            <Button title="Cancel" onPress={onClose} color="#666" />
          </View>
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
    maxHeight: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginVertical: 6,
    borderRadius: 4,
  },
  picker: {
    marginVertical: 5,
    backgroundColor: "#f2f2f2",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
});
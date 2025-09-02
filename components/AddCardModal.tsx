import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/store/authStore";
import { teamsService } from "@/services/teams";
import { TeamMember } from "@/models/teams";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    description: string,
    storyPoint: number,
    assignee: string,
  ) => void;
  columnTitle: string;
};

export const AddCardModal = ({ visible, onClose, onSubmit }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyPoint, setStoryPoint] = useState<number>(0);
  const [assignee, setAssignee] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const selectedTeam = useAuth((state) => state.selectedTeam);

  useEffect(() => {
    if (visible && selectedTeam) {
      loadTeamMembers();
    }
  }, [visible, selectedTeam]);

  useEffect(() => {
    setAssignee("");
  }, [selectedTeam]);

  const loadTeamMembers = async () => {
    if (!selectedTeam) {
      console.log("No selected team to load members for");
      return;
    }

    try {
      const response = await teamsService.getTeam(selectedTeam);

      if (response.success && response.team) {
        const members = response.team.members || [];
        setTeamMembers(members);
        if (
          assignee &&
          members.length > 0 &&
          !members.some((member) => member.username === assignee)
        ) {
          setAssignee("");
        }
      } else {
        setTeamMembers([]);
      }
    } catch (error: any) {
      console.error("Failed to load team members:", error);

      if (error.response?.status === 401) {
        console.log("Authentication error");
      }
      setTeamMembers([]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      onSubmit(title, description, storyPoint, assignee);
      setTitle("");
      setDescription("");
      setStoryPoint(0);
      setAssignee("");
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
          <Text style={styles.label}>Assignee:</Text>
          <Picker
            selectedValue={assignee}
            onValueChange={(value) => setAssignee(value)}
            style={styles.picker}
          >
            <Picker.Item label="No assignee" value="" />
            {teamMembers.map((member) => (
              <Picker.Item
                key={member.user_id}
                label={`${member.username}`}
                value={member.username}
              />
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
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 5,
    color: "#000",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#8E8E93",
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
});

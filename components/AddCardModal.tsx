import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/store/authStore";
import { teamsService } from "@/services/teams";
import { TeamMemberWithUsername } from "@/models/teams";

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
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithUsername[]>([]);

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
      const response = await teamsService.getTeamWithUsernames(selectedTeam);

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

  // Fibonacci values shown as chips
  const FIB = [1, 2, 3, 5, 8, 13, 21];

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
                label={member.username}
                value={member.username}
              />
            ))}
          </Picker>
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
                    style={[
                      styles.spChip,
                      active ? styles.spChipActive : styles.spChipDefault,
                    ]}
                  >
                    <Text
                      style={
                        active ? styles.spTextActive : styles.spTextDefault
                      }
                    >
                      {opt}
                    </Text>
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
  spChipDefault: { backgroundColor: "#fff", borderColor: "#e5e5e5" },
  spChipActive: { backgroundColor: "#2563eb", borderColor: "#1d4ed8" },
  spTextDefault: { color: "#111827", fontWeight: "600" },
  spTextActive: { color: "#fff", fontWeight: "700" },
  picker: {
    marginVertical: 10,
    backgroundColor: "#f2f2f2",
  },
});

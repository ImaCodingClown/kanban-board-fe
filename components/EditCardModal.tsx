import React, { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useAuth } from "@/store/authStore";
import { CardModel } from "../models/board";
import { editCard } from "@/services/card";
import { Picker } from "@react-native-picker/picker";
import { teamsService } from "@/services/teams";
import { TeamMember } from "@/models/teams";

type Props = {
  visible: boolean;
  onClose: () => void;
  card: CardModel & { columnTitle: string };
  onSuccess?: (
    title: string,
    description: string,
    storyPoint: number,
    assignee: string,
  ) => void;
};

export const EditCardModal = ({ visible, onClose, card, onSuccess }: Props) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [storyPoint, setStoryPoint] = useState<number>(card.story_point ?? 0);
  const [assignee, setAssignee] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const selectedTeam = useAuth((state) => state.selectedTeam);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
      setStoryPoint(card.story_point ?? 0);
      setAssignee(card.assignee ?? "");
    }
  }, [card]);

  useEffect(() => {
    if (visible && selectedTeam) {
      loadTeamMembers();
    }
  }, [visible, selectedTeam]);

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
      await editCard({
        cardId: card._id!,
        title,
        description,
        columnTitle: card.columnTitle,
        storyPoint,
        assignee,
        team: selectedTeam!,
      });

      onSuccess?.(title, description, storyPoint, assignee);
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
                label={`${member.username} (${member.role})`}
                value={member.username}
              />
            ))}
          </Picker>
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
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 5,
    color: "#000",
  },
});

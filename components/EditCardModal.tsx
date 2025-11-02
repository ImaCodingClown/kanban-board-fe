import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "@/store/authStore";
import { CardModel } from "../models/board";
import { editCard } from "@/services/card";
import { Picker } from "@react-native-picker/picker";
import { teamsService } from "@/services/teams";
import { TeamMemberWithUsername } from "@/models/teams";
import { Pressable } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  card: CardModel & {
    columnTitle: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
  };
  onSuccess?: (
    title: string,
    description: string,
    storyPoint: number,
    assignee: string,
    priority: "LOW" | "MEDIUM" | "HIGH",
  ) => void;
};

export const EditCardModal = ({ visible, onClose, card, onSuccess }: Props) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [storyPoint, setStoryPoint] = useState<number>(card.story_point ?? 0);
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(
    card.priority ?? "MEDIUM",
  );
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithUsername[]>([]);

  const selectedTeam = useAuth((state) => state.selectedTeam);

  const loadTeamMembers = useCallback(async () => {
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
  }, [selectedTeam, assignee]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
      setStoryPoint(card.story_point ?? 0);
      setAssignee(card.assignee ?? "");
      setPriority(card.priority ?? "MEDIUM");
    }
  }, [card]);

  useEffect(() => {
    if (visible && selectedTeam) {
      loadTeamMembers();
    }
  }, [visible, selectedTeam, loadTeamMembers]);

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
        priority,
        team: selectedTeam!,
      });

      onSuccess?.(title, description, storyPoint, assignee, priority);
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
          {card.card_id && (
            <View style={styles.cardIdDisplay}>
              <Text style={styles.cardIdLabel}>Card ID:</Text>
              <Text style={styles.cardIdValue}>{card.card_id}</Text>
            </View>
          )}
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
          <Text style={styles.label}>Priority:</Text>
          <View style={styles.spShell}>
            <View style={styles.spRow}>
              {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => {
                const active = priority === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[
                      styles.spChip,
                      active &&
                        (p === "LOW"
                          ? styles.prLow
                          : p === "MEDIUM"
                            ? styles.prMed
                            : styles.prHigh),
                    ]}
                  >
                    <Text
                      style={
                        active ? styles.spTextActive : styles.spTextDefault
                      }
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
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
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 5,
    color: "#000",
  },
  spChipDefault: { backgroundColor: "#fff", borderColor: "#e5e5e5" },
  spChipActive: { backgroundColor: "#2563eb", borderColor: "#1d4ed8" },
  spTextDefault: { color: "#111827", fontWeight: "600" },
  spTextActive: { color: "#fff", fontWeight: "700" },
  picker: {
    marginVertical: 10,
    backgroundColor: "#f2f2f2",
  },
  prLow: { backgroundColor: "#22c55e", borderColor: "#16a34a" },
  prMed: { backgroundColor: "#f59e0b", borderColor: "#d97706" },
  prHigh: { backgroundColor: "#ef4444", borderColor: "#dc2626" },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginVertical: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
  },
  cancelButtonText: {
    color: "#fff",
  },
  cardIdDisplay: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginVertical: 6,
  },
  cardIdLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
  },
  cardIdValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "@/store/authStore";

export const TeamSelector: React.FC = () => {
  const user = useAuth((state) => state.user);
  const selectedTeam = useAuth((state) => state.selectedTeam);
  const setSelectedTeam = useAuth((state) => state.setSelectedTeam);

  if (!user || !user.teams || user.teams.length === 0) {
    return null;
  }

  if (user.teams.length === 1) {
    return (
      <View style={styles.singleTeamContainer}>
        <Text style={styles.singleTeamText}>{user.teams[0]}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedTeam}
        onValueChange={(itemValue: string) => setSelectedTeam(itemValue)}
        style={styles.picker}
      >
        {user.teams.map((team) => (
          <Picker.Item key={team} label={team} value={team} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 150,
    maxWidth: 200,
  },
  picker: {
    color: "#007AFF",
    fontWeight: "600",
  },
  singleTeamContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
  },
  singleTeamText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

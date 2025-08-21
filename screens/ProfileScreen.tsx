import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "@/store/authStore";

export const ProfileScreen = () => {
  const user = useAuth.getState().user;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user ? (
        <>
          <Text>Username: {user.username}</Text>
          <Text>Email: {user.email}</Text>
          <Text>Teams: {user.teams}</Text>
        </>
      ) : (
        <Text>You are not logged in.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
});

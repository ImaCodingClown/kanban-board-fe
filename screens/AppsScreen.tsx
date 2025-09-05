import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export const AppsScreen = () => {
  const router = useRouter();

  const modules = [
    { name: "Board", icon: "🗂️", route: "/board" },
    { name: "Teams", icon: "👥", route: "/teams" },
    { name: "Profile", icon: "👤", route: "/profile" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apps</Text>
      <View style={styles.list}>
        {modules.map((mod) => (
          <TouchableOpacity
            key={mod.name}
            style={styles.item}
            onPress={() => router.push(mod.route)}
          >
            <Text style={styles.icon}>{mod.icon}</Text>
            <Text style={styles.label}>{mod.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
    color: "#1e293b",
  },
  list: { width: "80%" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  icon: { fontSize: 28, marginRight: 18 },
  label: { fontSize: 18, color: "#374151", fontWeight: "600" },
});

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  activeText: {
    color: "#007aff",
    fontWeight: "bold",
  },
  inactiveText: {
    color: "#555",
  },
});

export default styles;

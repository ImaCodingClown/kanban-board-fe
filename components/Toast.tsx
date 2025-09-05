import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ToastProps {
  visible: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  onClose,
}) => {
  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return { backgroundColor: "#4CAF50", icon: "checkmark-circle" };
      case "error":
        return { backgroundColor: "#F44336", icon: "close-circle" };
      case "warning":
        return { backgroundColor: "#FF9800", icon: "warning" };
      case "info":
        return { backgroundColor: "#2196F3", icon: "information-circle" };
      default:
        return { backgroundColor: "#757575", icon: "help-circle" };
    }
  };

  const toastStyle = getToastStyle();

  return (
    <View style={styles.container}>
      <View
        style={[styles.toast, { backgroundColor: toastStyle.backgroundColor }]}
      >
        <View style={styles.content}>
          <Ionicons name={toastStyle.icon as any} size={24} color="white" />
          <Text style={styles.message}>{message}</Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  message: {
    color: "white",
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    fontWeight: "500",
  },
  closeButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    minWidth: 32,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});

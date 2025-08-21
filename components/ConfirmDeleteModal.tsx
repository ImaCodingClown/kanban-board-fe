import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

export const ConfirmDeleteModal = ({
  visible,
  onClose,
  onConfirm,
  title = "Delete Card",
  message = "Are you sure you want to delete this item?",
  confirmText = "Yes, Delete",
  cancelText = "No, Cancel",
}: Props) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <Button title={cancelText} onPress={onClose} color="#666" />
            </View>
            <View style={styles.buttonWrapper}>
              <Button
                title={confirmText}
                onPress={handleConfirm}
                color="#ff4444"
              />
            </View>
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
    maxWidth: 300,
    borderRadius: 8,
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
  },
});

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UI_CONSTANTS } from "@/constants/ui";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  subtext?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
};

export const ConfirmDeleteModal = ({
  visible,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete",
  itemName,
  subtext = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
}: Props) => {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.deleteModalContent}>
          <View style={styles.deleteIconContainer}>
            <Ionicons name="warning" size={56} color="#FF9500" />
          </View>

          <Text style={styles.deleteModalTitle}>{title}</Text>

          <Text style={styles.deleteModalMessage}>
            {message}{" "}
            {itemName && (
              <Text style={styles.itemNameHighlight}>"{itemName}"</Text>
            )}
            ?
          </Text>
          <Text style={styles.deleteModalSubtext}>{subtext}</Text>

          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              style={[styles.deleteModalButton, styles.deleteCancelButton]}
              onPress={handleClose}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteCancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteModalButton,
                styles.deleteConfirmButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleConfirm}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View style={styles.deleteButtonContent}>
                  <Text style={styles.deleteButtonText}>{confirmText}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: UI_CONSTANTS.MODAL.OVERLAY_BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContent: {
    backgroundColor: UI_CONSTANTS.COLORS.CARD_BACKGROUND,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.LARGE,
    padding: UI_CONSTANTS.SPACING.XXLARGE,
    width: UI_CONSTANTS.MODAL.WIDTH,
    maxWidth: UI_CONSTANTS.MODAL.MAX_WIDTH,
    alignItems: "center",
    ...UI_CONSTANTS.SHADOW.MODAL,
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF4E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: UI_CONSTANTS.SPACING.LARGE,
  },
  deleteModalTitle: {
    fontSize: UI_CONSTANTS.FONT_SIZES.XXLARGE,
    fontWeight: "700",
    color: UI_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: UI_CONSTANTS.SPACING.MEDIUM,
    textAlign: "center",
  },
  deleteModalMessage: {
    fontSize: UI_CONSTANTS.FONT_SIZES.MEDIUM,
    color: UI_CONSTANTS.COLORS.TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: UI_CONSTANTS.SPACING.SMALL,
    lineHeight: 22,
  },
  itemNameHighlight: {
    fontWeight: "700",
    color: UI_CONSTANTS.COLORS.PRIMARY,
  },
  deleteModalSubtext: {
    fontSize: UI_CONSTANTS.FONT_SIZES.SMALL,
    color: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: "center",
    marginBottom: UI_CONSTANTS.SPACING.XXLARGE,
    lineHeight: 18,
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: UI_CONSTANTS.SPACING.MEDIUM,
    width: "100%",
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: UI_CONSTANTS.SPACING.MEDIUM,
    paddingHorizontal: UI_CONSTANTS.SPACING.LARGE,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.MEDIUM,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteCancelButton: {
    backgroundColor: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
  },
  deleteCancelButtonText: {
    color: "white",
    fontSize: UI_CONSTANTS.FONT_SIZES.MEDIUM,
    fontWeight: "600",
  },
  deleteConfirmButton: {
    backgroundColor: UI_CONSTANTS.COLORS.ERROR,
  },
  deleteButtonText: {
    color: "white",
    fontSize: UI_CONSTANTS.FONT_SIZES.MEDIUM,
    fontWeight: "600",
  },
  deleteButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: UI_CONSTANTS.SPACING.SMALL,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

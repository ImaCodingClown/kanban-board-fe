import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UI_CONSTANTS, BUTTON_STYLES } from "@/constants/ui";

interface TeamActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  style?: ViewStyle;
  size?: number;
}

export const TeamActionButton: React.FC<TeamActionButtonProps> = ({
  icon,
  color,
  onPress,
  style,
  size = UI_CONSTANTS.ICON_SIZES.MEDIUM,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    ...BUTTON_STYLES.ACTION,
  },
});

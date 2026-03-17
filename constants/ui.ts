export const UI_CONSTANTS = {
  MODAL: {
    MAX_HEIGHT: "80%",
    WIDTH: "90%",
    MAX_WIDTH: 400,
    OVERLAY_BACKGROUND: "rgba(0, 0, 0, 0.5)",
  },
  COLORS: {
    PRIMARY: "#007AFF",
    PRIMARY_BACKGROUND: "#F0F8FF",
    ERROR: "#FF3B30",
    ERROR_BACKGROUND: "#FFF0F0",
    SUCCESS: "#34C759",
    WARNING: "#FF9500",
    INFO: "#2196F3",
    BACKGROUND: "#F2F2F7",
    CARD_BACKGROUND: "#FFFFFF",
    TEXT_PRIMARY: "#000000",
    TEXT_SECONDARY: "#8E8E93",
    TEXT_TERTIARY: "#666666",
    BORDER: "#E5E5EA",
    BORDER_LIGHT: "#E1E1E1",
  },
  SPACING: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
    XLARGE: 20,
    XXLARGE: 24,
  },
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 12,
    LARGE: 16,
  },
  ICON_SIZES: {
    SMALL: 16,
    MEDIUM: 20,
    LARGE: 24,
    XLARGE: 28,
  },
  FONT_SIZES: {
    SMALL: 12,
    MEDIUM: 14,
    LARGE: 16,
    XLARGE: 18,
    XXLARGE: 20,
    TITLE: 24,
    HEADER: 28,
  },
  SHADOW: {
    CARD: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    MODAL: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    NAVBAR: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
} as const;

export const BUTTON_STYLES = {
  PRIMARY: {
    paddingVertical: UI_CONSTANTS.SPACING.SMALL,
    paddingHorizontal: UI_CONSTANTS.SPACING.MEDIUM,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: UI_CONSTANTS.COLORS.PRIMARY,
  },
  SECONDARY: {
    paddingVertical: UI_CONSTANTS.SPACING.SMALL,
    paddingHorizontal: UI_CONSTANTS.SPACING.MEDIUM,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: UI_CONSTANTS.COLORS.BACKGROUND,
  },
  ACTION: {
    padding: UI_CONSTANTS.SPACING.SMALL,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: UI_CONSTANTS.COLORS.PRIMARY_BACKGROUND,
  },
  DELETE: {
    padding: UI_CONSTANTS.SPACING.SMALL,
    borderRadius: UI_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: UI_CONSTANTS.COLORS.ERROR_BACKGROUND,
  },
} as const;

export const VALIDATION = {
  BOARD_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
} as const;

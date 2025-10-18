export const UI_CONSTANTS = {
  MODAL: {
    MAX_HEIGHT: "80%",
    WIDTH: "90%",
    MAX_WIDTH: 400,
    OVERLAY_BACKGROUND: "rgba(0, 0, 0, 0.5)",
  },
  COLORS: {
    PRIMARY: "#007AFF",
    ERROR: "#FF3B30",
    SUCCESS: "#34C759",
    WARNING: "#FF9500",
    INFO: "#2196F3",
    BACKGROUND: "#F2F2F7",
    CARD_BACKGROUND: "#FFFFFF",
    TEXT_PRIMARY: "#000000",
    TEXT_SECONDARY: "#8E8E93",
    BORDER: "#E5E5EA",
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
  },
} as const;

export const VALIDATION = {
  BOARD_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
} as const;

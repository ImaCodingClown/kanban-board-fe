export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
};

export const getErrorMessage = (error: unknown, fallback: string): string => {
  const message = handleApiError(error);
  return message || fallback;
};

export const validateBoardName = (
  name: string,
): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, error: "Board name is required" };
  }

  if (trimmedName.length < 1) {
    return { isValid: false, error: "Board name must be at least 1 character" };
  }

  if (trimmedName.length > 50) {
    return {
      isValid: false,
      error: "Board name must be less than 50 characters",
    };
  }

  return { isValid: true };
};

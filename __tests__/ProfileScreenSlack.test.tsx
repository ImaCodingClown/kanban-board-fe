import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { ProfileScreen } from "../screens/ProfileScreen";
import { usersService } from "../services/users";
import { useAuth } from "../store/authStore";

// Mock the dependencies
jest.mock("../store/authStore");
jest.mock("../services/users");
jest.mock("../services/teams");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUsersService = usersService as jest.Mocked<typeof usersService>;

describe("ProfileScreen Slack Integration", () => {
  const mockUser = {
    id: "user123",
    username: "testuser",
    email: "test@example.com",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    is_active: true,
    slack_user_id: undefined,
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
    } as any);

    mockUsersService.updateSlackUserId = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays "Not connected" when user has no Slack ID', () => {
    const { getByText } = render(<ProfileScreen />);

    expect(getByText("Not connected")).toBeTruthy();
    expect(getByText("Connect")).toBeTruthy();
  });

  it("displays Slack ID when user has one", () => {
    const userWithSlack = { ...mockUser, slack_user_id: "U01ABC2DEF3" };
    mockUseAuth.mockReturnValue({
      user: userWithSlack,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
    } as any);

    const { getByText } = render(<ProfileScreen />);

    expect(getByText("U01ABC2DEF3")).toBeTruthy();
    expect(getByText("Edit")).toBeTruthy();
  });

  it("shows edit form when Connect/Edit button is pressed", () => {
    const { getByText, getByPlaceholderText } = render(<ProfileScreen />);

    const connectButton = getByText("Connect");
    fireEvent.press(connectButton);

    expect(
      getByPlaceholderText("Enter your Slack User ID (e.g., U01ABC2DEF3)"),
    ).toBeTruthy();
    expect(getByText("Save")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("saves Slack ID successfully", async () => {
    const mockResponse = {
      success: true,
      user: { ...mockUser, slack_user_id: "U01ABC2DEF3" },
      message: "Slack ID updated successfully",
    };

    mockUsersService.updateSlackUserId.mockResolvedValue(mockResponse);

    const { getByText, getByPlaceholderText } = render(<ProfileScreen />);

    // Enter edit mode
    fireEvent.press(getByText("Connect"));

    // Enter Slack ID
    const input = getByPlaceholderText(
      "Enter your Slack User ID (e.g., U01ABC2DEF3)",
    );
    fireEvent.changeText(input, "U01ABC2DEF3");

    // Save
    fireEvent.press(getByText("Save"));

    await waitFor(() => {
      expect(mockUsersService.updateSlackUserId).toHaveBeenCalledWith(
        "user123",
        "U01ABC2DEF3",
      );
    });
  });

  it("cancels edit mode and resets input", () => {
    const { getByText, getByPlaceholderText } = render(<ProfileScreen />);

    // Enter edit mode
    fireEvent.press(getByText("Connect"));

    // Enter some text
    const input = getByPlaceholderText(
      "Enter your Slack User ID (e.g., U01ABC2DEF3)",
    );
    fireEvent.changeText(input, "U01ABC2DEF3");

    // Cancel
    fireEvent.press(getByText("Cancel"));

    // Should be back to display mode
    expect(getByText("Not connected")).toBeTruthy();
    expect(getByText("Connect")).toBeTruthy();
  });

  it("shows help text for Slack integration", () => {
    const { getByText } = render(<ProfileScreen />);

    expect(
      getByText(/Connect your Slack account to receive notifications/),
    ).toBeTruthy();
    expect(
      getByText(/Find your Slack User ID in your Slack profile settings/),
    ).toBeTruthy();
  });

  it("handles API errors gracefully", async () => {
    mockUsersService.updateSlackUserId.mockRejectedValue(
      new Error("API Error"),
    );

    const { getByText, getByPlaceholderText } = render(<ProfileScreen />);

    // Enter edit mode and try to save
    fireEvent.press(getByText("Connect"));
    fireEvent.changeText(
      getByPlaceholderText("Enter your Slack User ID (e.g., U01ABC2DEF3)"),
      "U01ABC2DEF3",
    );
    fireEvent.press(getByText("Save"));

    await waitFor(() => {
      expect(mockUsersService.updateSlackUserId).toHaveBeenCalled();
    });
  });
});

import React from "react";
import {
  render,
  waitFor,
  within,
  fireEvent,
} from "@testing-library/react-native";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock("@/store/authStore", () => ({
  useAuth: jest.fn((selector) => {
    const mockState = {
      selectedTeam: "test-team",
      user: {
        id: "user-1",
        username: "testuser",
        email: "test@example.com",
        teams: ["test-team"],
      },
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

jest.mock("@/services/card", () => ({
  addCard: jest.fn(),
  deleteCard: jest.fn(),
  editCard: jest.fn(),
}));

jest.mock("../hooks/useBoard", () => ({
  useBoard: jest.fn(),
  useUpdateBoard: jest.fn(() => ({
    mutate: jest.fn(),
  })),
}));

jest.mock("../components/AddCardModal", () => {
  const React = require("react");
  const { View, Text } = require("react-native");

  return {
    AddCardModal: ({ visible, onClose, onSubmit, columnTitle }: any) => {
      if (!visible) return null;

      return (
        <View testID="add-card-modal">
          <Text>Add Card</Text>
          <Text>Column: {columnTitle}</Text>
        </View>
      );
    },
  };
});

jest.mock("react-native-drax", () => {
  const React = require("react");
  const { View } = require("react-native");

  type mockDraxViewProps = React.ComponentProps<typeof View> & {
    onReceiveDragDrop?: (event: { dragged: { payload: string } }) => void;
  };

  const DraxView = (props: mockDraxViewProps) => <View {...props} />;

  const DraxProvider = (props: React.ComponentProps<typeof View>) => (
    <View {...props} />
  );

  return {
    DraxProvider,
    DraxView,
  };
});

import { BoardScreen } from "../screens/BoardScreen";
import { useBoard } from "../hooks/useBoard";
import { BoardModel, ColumnModel } from "../models/board";

const mockBoardData: BoardModel = {
  id: "board-1",
  team: "test-team",
  iteration: "sprint-1",
  columns: [
    {
      title: "To Do",
      cards: [
        {
          _id: "card-1",
          title: "Task 1",
          description: "Description for task 1",
        },
        {
          _id: "card-2",
          title: "Task 2",
          description: "Description for task 2",
        },
      ],
    },
    {
      title: "In Progress",
      cards: [
        {
          _id: "card-3",
          title: "Task 3",
          description: "Description for task 3",
        },
      ],
    },
    {
      title: "Done",
      cards: [],
    },
  ],
};

describe("BoardScreen", () => {
  beforeEach(() => {
    (useBoard as jest.Mock).mockClear();
  });

  it("should render a loading indicator when data is being fetched", () => {
    (useBoard as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { getByText } = render(<BoardScreen />);
    expect(getByText("Loading board for team: test-team")).toBeTruthy();
  });

  it("should render the board with columns and cards when data is loaded", async () => {
    (useBoard as jest.Mock).mockReturnValue({
      data: mockBoardData,
      isLoading: false,
    });

    const { getByText } = render(<BoardScreen />);

    await waitFor(() => {
      expect(getByText("To Do")).toBeTruthy();
      expect(getByText("In Progress")).toBeTruthy();
      expect(getByText("Done")).toBeTruthy();

      expect(getByText("Task 1")).toBeTruthy();
      expect(getByText("Task 2")).toBeTruthy();
      expect(getByText("Task 3")).toBeTruthy();

      expect(getByText("Description for task 1")).toBeTruthy();
    });
  });

  it("should handle drag and drop of a card to a new column", async () => {
    (useBoard as jest.Mock).mockReturnValue({
      data: mockBoardData,
      isLoading: false,
    });

    const { getByTestId } = render(<BoardScreen />);

    await waitFor(() => {
      expect(getByTestId("column-To Do")).toBeTruthy();
      expect(getByTestId("column-In Progress")).toBeTruthy();
      expect(getByTestId("column-Done")).toBeTruthy();
    });

    const toDoColumn = getByTestId("column-To Do");
    expect(within(toDoColumn).getByText("Task 1")).toBeTruthy();
    expect(within(toDoColumn).getByText("Task 2")).toBeTruthy();
  });

  it("should render an empty board correctly", async () => {
    (useBoard as jest.Mock).mockReturnValue({
      data: {
        id: "board-1",
        team: "test-team",
        iteration: "sprint-1",
        columns: [],
      },
      isLoading: false,
    });

    const { queryByText } = render(<BoardScreen />);

    await waitFor(() => {
      expect(queryByText(/To Do/i)).toBeNull();
      expect(queryByText(/Task/i)).toBeNull();
    });
  });

  it("should render error message when there is an error", () => {
    (useBoard as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load board"),
    });

    const { getByText } = render(<BoardScreen />);
    expect(getByText("Error loading board")).toBeTruthy();
  });

  it("should render authentication error when user is not authenticated", () => {
    jest
      .mocked(require("@/store/authStore").useAuth)
      .mockImplementation((selector: any) => {
        const mockState = {
          selectedTeam: "test-team",
          user: null,
        };
        return selector ? selector(mockState) : mockState;
      });

    (useBoard as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { getByText } = render(<BoardScreen />);
    expect(getByText("User not authenticated")).toBeTruthy();
  });

  it("should render no team selected error when no team is selected", () => {
    jest
      .mocked(require("@/store/authStore").useAuth)
      .mockImplementation((selector: any) => {
        const mockState = {
          selectedTeam: undefined,
          user: {
            id: "user-1",
            username: "testuser",
            email: "test@example.com",
            teams: [],
          },
        };
        return selector ? selector(mockState) : mockState;
      });

    (useBoard as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { getByText } = render(<BoardScreen />);
    expect(getByText("No team selected")).toBeTruthy();
  });

  it("should open add card modal when add card button is clicked", async () => {
    jest
      .mocked(require("@/store/authStore").useAuth)
      .mockImplementation((selector: any) => {
        const mockState = {
          selectedTeam: "test-team",
          user: {
            id: "user-1",
            username: "testuser",
            email: "test@example.com",
            teams: ["test-team"],
          },
        };
        return selector ? selector(mockState) : mockState;
      });

    (useBoard as jest.Mock).mockReturnValue({
      data: mockBoardData,
      isLoading: false,
    });

    const { getByTestId, getByText, getAllByText } = render(<BoardScreen />);

    await waitFor(() => {
      expect(getByTestId("column-To Do")).toBeTruthy();
    });

    const addCardButtons = getAllByText("+ Add Card");
    const addCardButton = addCardButtons[0];

    fireEvent.press(addCardButton);

    await waitFor(
      () => {
        expect(getByText("Add Card")).toBeTruthy();
        expect(getByText("Column: To Do")).toBeTruthy();
      },
      { timeout: 1000 },
    );
  });

  it("should open edit card modal when edit button is clicked", async () => {
    jest
      .mocked(require("@/store/authStore").useAuth)
      .mockImplementation((selector: any) => {
        const mockState = {
          selectedTeam: "test-team",
          user: {
            id: "user-1",
            username: "testuser",
            email: "test@example.com",
            teams: ["test-team"],
          },
        };
        return selector ? selector(mockState) : mockState;
      });

    (useBoard as jest.Mock).mockReturnValue({
      data: mockBoardData,
      isLoading: false,
    });

    const { getByTestId, getByText, getAllByText } = render(<BoardScreen />);

    await waitFor(() => {
      expect(getByTestId("column-To Do")).toBeTruthy();
    });

    const editButtons = getAllByText("edit");
    fireEvent.press(editButtons[0]);

    await waitFor(() => {
      expect(getByText("Edit Card")).toBeTruthy();
    });
  });

  it("should open delete confirmation modal when delete button is clicked", async () => {
    jest
      .mocked(require("@/store/authStore").useAuth)
      .mockImplementation((selector: any) => {
        const mockState = {
          selectedTeam: "test-team",
          user: {
            id: "user-1",
            username: "testuser",
            email: "test@example.com",
            teams: ["test-team"],
          },
        };
        return selector ? selector(mockState) : mockState;
      });

    (useBoard as jest.Mock).mockReturnValue({
      data: mockBoardData,
      isLoading: false,
    });

    const { getByTestId, getByText, getAllByText } = render(<BoardScreen />);

    await waitFor(() => {
      expect(getByTestId("column-To Do")).toBeTruthy();
    });

    const deleteButtons = getAllByText("❌");
    fireEvent.press(deleteButtons[0]);

    await waitFor(() => {
      expect(
        getByText('Are you sure you want to delete "Task 1"?'),
      ).toBeTruthy();
    });
  });

  it("should render no board found message when board has no columns", async () => {
    jest
      .mocked(require("@/store/authStore").useAuth)
      .mockImplementation((selector: any) => {
        const mockState = {
          selectedTeam: "test-team",
          user: {
            id: "user-1",
            username: "testuser",
            email: "test@example.com",
            teams: ["test-team"],
          },
        };
        return selector ? selector(mockState) : mockState;
      });

    (useBoard as jest.Mock).mockReturnValue({
      data: {
        id: "board-1",
        team: "test-team",
        iteration: "sprint-1",
        columns: [],
      },
      isLoading: false,
    });

    const { getByText } = render(<BoardScreen />);

    await waitFor(() => {
      expect(getByText("No board found for team: test-team")).toBeTruthy();
    });
  });
});

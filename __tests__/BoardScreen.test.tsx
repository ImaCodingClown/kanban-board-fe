import React from "react";
import {
  render,
  waitFor,
  within,
  RenderAPI,
  act,
} from "@testing-library/react-native";
import { BoardScreen } from "../screens/BoardScreen";
import { useBoard } from "../hooks/useBoard";
import { ColumnModel } from "../models/board";
import { DraxProvider, DraxView } from "react-native-drax";

jest.mock("../hooks/useBoard");

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

const mockBoardData: ColumnModel[] = [
  {
    title: "To Do",
    cards: [
      { id: "card-1", title: "Task 1", description: "Description for task 1" },
      { id: "card-2", title: "Task 2", description: "Description for task 2" },
    ],
  },
  {
    title: "In Progress",
    cards: [
      { id: "card-3", title: "Task 3", description: "Description for task 3" },
    ],
  },
  {
    title: "Done",
    cards: [],
  },
];

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
    expect(getByText("Loading board...")).toBeTruthy();
  });

  it("should render the board with columns and cards when data is loaded", async () => {
    (useBoard as jest.Mock).mockReturnValue({
      data: mockBoardData,
      isLoading: false,
    });

    const { getByText } = render(<BoardScreen />);

    await waitFor(() => {
      // Check for column titles
      expect(getByText("To Do")).toBeTruthy();
      expect(getByText("In Progress")).toBeTruthy();
      expect(getByText("Done")).toBeTruthy();

      // Check for card titles
      expect(getByText("Task 1")).toBeTruthy();
      expect(getByText("Task 2")).toBeTruthy();
      expect(getByText("Task 3")).toBeTruthy();

      // Check for card descriptions
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
    });

    const toDoColumn = getByTestId("column-To Do");
    const inProgressColumn = getByTestId("column-In Progress");

    expect(within(toDoColumn).getByText("Task 1")).toBeTruthy();

    const { onReceiveDragDrop } = inProgressColumn.props;

    act(() => {
      onReceiveDragDrop({ dragged: { payload: "card-1" } });
    });

    await waitFor(() => {
      expect(within(inProgressColumn).getByText("Task 1")).toBeTruthy();
    });

    expect(within(toDoColumn).queryByText("Task 1")).toBeNull();
  });

  it("should render an empty board correctly", async () => {
    (useBoard as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    const { queryByText } = render(<BoardScreen />);

    await waitFor(() => {
      expect(queryByText(/To Do/i)).toBeNull();
      expect(queryByText(/Task/i)).toBeNull();
    });
  });
});

// __tests__/BoardScreen.test.tsx
import { render, waitFor } from "@testing-library/react-native";
import { BoardScreen } from "../screens/BoardScreen";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
// import { server } from "../__mocks__/server";
import { DraxProvider } from "react-native-drax";

// Allow 'mock-drax-view' as a valid JSX element for testing
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "mock-drax-view": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { payload?: any };
      "mock-drax-provider": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { payload?: any };
    }
  }
}

jest.mock("react-native-drax", () => ({
  DraxProvider: ({ children }: { children?: React.ReactNode }) => (
    <mock-drax-provider>{children}</mock-drax-provider>
  ),
  DraxView: ({
    children,
    draggable,
    payload,
  }: {
    children?: React.ReactNode;
    draggable?: boolean;
    payload?: any;
  }) => (
    <mock-drax-view draggable={draggable} payload={payload}>
      {children}
    </mock-drax-view>
  ),
}));
//
// beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

const queryClient = new QueryClient();
test("renders board data from backend", async () => {
  const { getByText } = render(
    <QueryClientProvider client={queryClient}>
      <BoardScreen />
    </QueryClientProvider>,
  );

  await waitFor(() => {
    expect(getByText("To Do")).toBeTruthy();
  });
});

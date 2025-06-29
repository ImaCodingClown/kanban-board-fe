// // __tests__/BoardScreen.test.tsx
// import {
//   render,
//   waitFor,
//   waitForElementToBeRemoved,
// } from "@testing-library/react-native";
// import { BoardScreen } from "../screens/BoardScreen";
// import React from "react";
// import { QueryClient, QueryClientProvider } from "react-query";
// import { act } from "react";
// // import { server } from "../__mocks__/server";

// // Allow 'mock-drax-view' as a valid JSX element for testing
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       "mock-drax-view": React.DetailedHTMLProps<
//         React.HTMLAttributes<HTMLElement>,
//         HTMLElement
//       > & { payload?: any };
//       "mock-drax-provider": React.DetailedHTMLProps<
//         React.HTMLAttributes<HTMLElement>,
//         HTMLElement
//       > & { payload?: any };
//     }
//   }
// }
// //
// // jest.mock("react-native-drax", () => {
// //   const React = require("react");
// //   const { View } = require("react-native");
// //
// //   return {
// //     DraxProvider: ({ children, ...props }: { children?: React.ReactNode }) => (
// //       <View {...props} testID="mock-drax-provider">
// //         {children}
// //       </View>
// //     ),
// //     DraxView: ({ children, ...props }: any) => (
// //       <View {...props} testID="mock-drax-view">
// //         {children}
// //       </View>
// //     ),
// //   };
// // });

// test("renders board data from backend", async () => {
//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: {
//         retry: false,
//         suspense: false,
//       },
//     },
//   });

//   const renderResult = render(
//     <QueryClientProvider client={queryClient}>
//       <BoardScreen />
//     </QueryClientProvider>,
//   );

//   const getByText = renderResult.getByText;

//   await waitForElementToBeRemoved(() => getByText("Loading board..."), {
//     timeout: 30000,
//   });

//   await waitFor(() => {
//     expect(getByText("To Do")).toBeTruthy();
//   });
// });

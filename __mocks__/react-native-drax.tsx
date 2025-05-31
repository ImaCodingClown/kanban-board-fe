import React from "react";
import { View } from "react-native";

export const DraxProvider = ({ children }: { children?: React.ReactNode }) => (
  <View>{children}</View>
);

export const DraxView = ({ children }: any) => <>{children}</>;

export const DraxScrollView = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

export const DraxList = ({ children, ...props }: any) => (
  <View {...props}>{children}</View>
);

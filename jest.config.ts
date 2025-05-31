module.exports = {
  preset: "jest-expo",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^msw/node$": require.resolve("msw/node"),
  },
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts",
    "./node_modules/react-native-gesture-handler/jestSetup.js",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testPathIgnorePatterns: ["node_modules/", "/android/", "/ios/"],
  transformIgnorePatterns: [
    "node_modules/(?!(expo-router|expo|@expo|@react-native|react-native|react-native-vector-icons|@react-navigation|msw|expo-modules-core|expo-router)/)",
  ],
  testEnvironment: "jsdom",
  testEnvironmentOptions: { customExportConditions: [""] },
  forceExit: true,
  watchAll: process.env.CI !== "true",
};

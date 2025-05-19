module.exports = {
  preset: "react-native",
  transform: {
    // '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        // Specify a custom Babel configuration
        presets: ["module:metro-react-native-babel-preset"],
        plugins: ["@babel/plugin-transform-flow-strip-types"],
      },
    ],
  },
  moduleNameMapper: {
    "^msw/node$": require.resolve("msw/node"),
  },
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts",
    "./node_modules/react-native-gesture-handler/jestSetup.js",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  transformIgnorePatterns: [
    "node_modules/(?!(@react-native|react-native|react-native-vector-icons|@react-navigation|msw)/)",
  ],
  testEnvironmentOptions: { customExportConditions: [""] },
  forceExit: true,
  watchAll: process.env.CI != "true",
};

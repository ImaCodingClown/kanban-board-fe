import { AppRegistry } from "react-native";
import { AuthNavigator } from "../navigation/AuthNavigator";
import { useAuth } from "../store/authStore";
import { AppNavigator } from "@/navigation/AppNavigator";
import { QueryClient, QueryClientProvider } from "react-query";
import { expo as appName } from "../app.json";

async function enableMocking() {
  if (!__DEV__) {
    return;
  }

  await import("../msw.polyfills");
  const { server } = await import("../__mocks__/server");
  server.listen();
}

enableMocking().then(() => {
  AppRegistry.registerComponent(appName.name, () => App);
});

const queryClient = new QueryClient();

export default function App() {
  const token = useAuth((state) => state.token);

  return (
    <QueryClientProvider client={queryClient}>
      {" "}
      {token ? <AppNavigator /> : <AuthNavigator />}{" "}
    </QueryClientProvider>
  );
}

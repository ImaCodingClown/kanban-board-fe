import { Stack, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { NavigationBar } from "../components/navigationBar";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isMockingEnabled, setMockingEnabled] = useState(!__DEV__);
  const pathname = usePathname();

  useEffect(() => {
    async function enableMocking() {
      if (!__DEV__) return;
      await import("../msw.polyfills");
      const { server } = await import("../__mocks__/server");
      server.listen();
      setMockingEnabled(true);
    }
    enableMocking();
  }, []);

  if (!isMockingEnabled) {
    return null;
  }

  const hideNavBarRoutes = ["/login", "/signup"];
  const showNavBar = !hideNavBarRoutes.includes(pathname);
  const NAVBAR_HEIGHT = 60;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { paddingTop: showNavBar ? NAVBAR_HEIGHT : 0 },
        }}
      />
      {showNavBar && <NavigationBar />}
    </QueryClientProvider>
  );
}

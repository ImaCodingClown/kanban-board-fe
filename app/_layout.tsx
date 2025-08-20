import { Stack, usePathname } from "expo-router";
import { QueryClient, QueryClientProvider } from "react-query";
import { NavigationBar } from "../components/navigationBar";

const queryClient = new QueryClient();

export default function RootLayout() {
  const pathname = usePathname();

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

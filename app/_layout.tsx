import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isMockingEnabled, setMockingEnabled] = useState(!__DEV__);
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

  const pathname = usePathname();
  const router = useRouter();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  );
}

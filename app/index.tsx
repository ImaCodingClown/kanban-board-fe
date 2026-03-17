import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/authStore";

export default function Index() {
  const router = useRouter();
  const accessToken = useAuth((state) => state.accessToken);
  const user = useAuth((state) => state.user);
  const checkTokenExpiry = useAuth((state) => state.checkTokenExpiry);
  const logout = useAuth((state) => state.logout);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (accessToken && user) {
      const isTokenValid = checkTokenExpiry();
      if (isTokenValid) {
        router.replace("/apps");
      } else {
        logout();
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [isReady, accessToken, user, router, checkTokenExpiry, logout]);

  return null;
}

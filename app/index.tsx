import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/authStore";

export default function Index() {
  const router = useRouter();
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (token && user) {
      router.replace("/teams");
    } else {
      router.replace("/login");
    }
  }, [isReady, token, user, router]);

  return null;
}

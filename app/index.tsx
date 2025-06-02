import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/authStore";

export default function Index() {
  const router = useRouter();
  const token = useAuth((state) => state.token);
  const [isReady, setIsReady] = useState(false);

  // Defer routing to allow _layout.tsx to mount first
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 0); // wait until next render cycle

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (token) {
      router.replace("/board");
    } else {
      router.replace("/login");
    }
  }, [isReady, token]);

  return null;
}

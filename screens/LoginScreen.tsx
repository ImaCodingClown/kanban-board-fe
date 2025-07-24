import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TextInput as RNTextInput,
} from "react-native";
import { api } from "../services/api";
import { useAuth } from "../store/authStore";
import { storeToken } from "../store/tokenStore";
import { useRouter } from "expo-router";

export const LoginScreen = () => {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<RNTextInput>(null);
  const setToken = useAuth((state) => state.setToken);
  const setUser = useAuth((state) => state.setUser);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post("/login", { userOrEmail, password });
      const token = response.data.token;
      await storeToken(token);
      setToken(token);

      const { data: me } = await api.get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({
        id: me.id,
        username: me.username,
        email: me.email,
        teams: [me.username],
      });

      // TODO: Replace LJY Members
      const team = "LJY Members";
      await api.post("/board", { team: team });
      router.replace("/board");
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        value={userOrEmail}
        onChangeText={setUserOrEmail}
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextInput
        ref={passwordRef}
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />
      <View style={styles.space}>
        <Button
          title={loading ? "Logging in…" : "Login"}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>
      <View style={styles.space}>
        <Button
          title="Don't have an account? Signup"
          onPress={() => router.push("/signup")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  space: { marginBottom: 5, width: "100%" },
});

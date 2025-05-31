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
import { useRouter } from "expo-router";

export const LoginScreen = () => {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef<RNTextInput>(null);
  const setToken = useAuth((state) => state.setToken);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await api.post("/login", { userOrEmail, password });
      setToken(response.data.token);
      router.replace("/board");
    } catch (error) {
      console.error(error);
      alert("Login failed");
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
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Don't have an account? Signup"
        onPress={() => router.push("/signup")}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

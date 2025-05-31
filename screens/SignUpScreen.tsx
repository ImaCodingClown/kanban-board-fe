import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { api } from "../services/api";
import { useAuth } from "../store/authStore";
import { useRouter } from "expo-router";

export const SignUpScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const setToken = useAuth((state) => state.setToken);
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const response = await api.post("/signup", { username, email, password });
      setToken(response.data.token); // Save JWT
      router.replace("/board"); // Go to Board screen
    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={handleSignup} />
      <Button
        title="Already have an account? Login"
        onPress={() => router.push("/login")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

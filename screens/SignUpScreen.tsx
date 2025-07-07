import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { api } from "../services/api";
import { useAuth } from "../store/authStore";
import { useRouter } from "expo-router";
import { storeToken } from "../store/tokenStore";
// import { store } from "expo-router/build/global-state/router-store";

export const SignUpScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const setToken = useAuth((state) => state.setToken);
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const response = await api.post("/signup", { username, email, password });

      const token = response.data.token;
      await storeToken(token);
      setToken(token);

      router.replace("/board");
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
      <View style={styles.space}>
        <Button title="Sign Up" onPress={handleSignup} />
      </View>
      <View style={styles.space}>
        <Button
          title="Already have an account? Login"
          onPress={() => router.push("/login")}
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

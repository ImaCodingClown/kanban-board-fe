import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TextInput as RNTextInput,
} from "react-native";
import { api } from "../services/api";
import { useAuth } from "../store/authStore";
import { useRouter } from "expo-router";
import { storeToken } from "../store/tokenStore";

export const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<RNTextInput>(null);
  const emailRef = useRef<RNTextInput>(null);
  const setToken = useAuth((state) => state.setToken);
  const setUser = useAuth((state) => state.setUser);
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    try {
      const response = await api.post("/signup", { username, email, password });
      const token = response.data.token;
      await storeToken(token);
      setToken(token);

      const { data: me } = await api.get("/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userTeams =
        me.teams && me.teams.length > 0 ? me.teams : ["LJY Members"];

      setUser({
        id: me.id,
        username: me.username,
        email: me.email,
        teams: userTeams,
      });

      router.replace("/teams");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/company-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Signup</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <TextInput
        style={styles.input}
        ref={emailRef}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <TextInput
        style={styles.input}
        ref={passwordRef}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        onSubmitEditing={handleSignup}
      />

      <View style={styles.space}>
        <Button
          title={loading ? "Signing up…" : "Sign Up"}
          onPress={handleSignup}
          disabled={loading}
        />
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
  logo: {
    width: 360,
    height: 360,
    alignSelf: "center",
    marginBottom: -50,
  },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  space: { marginBottom: 5, width: "100%" },
});

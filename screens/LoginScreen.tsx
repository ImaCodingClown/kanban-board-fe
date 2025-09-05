import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput as RNTextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { api } from "../services/api";
import { useAuth } from "../store/authStore";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export const LoginScreen = () => {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [userOrEmailError, setUserOrEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const passwordRef = useRef<RNTextInput>(null);
  const setTokens = useAuth((state) => state.setTokens);
  const setUser = useAuth((state) => state.setUser);
  const router = useRouter();

  const handleLogin = async () => {
    setLoginError("");
    setUserOrEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!userOrEmail.trim()) {
      setUserOrEmailError("Please enter username or email");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Please enter password");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);

    try {
      const response = await api.post("/login", { userOrEmail, password });

      if (!response.data || !response.data.access_token) {
        throw new Error("Invalid response from server");
      }

      const { access_token, refresh_token } = response.data;

      if (!access_token || !refresh_token) {
        throw new Error("Missing authentication tokens");
      }

      setTokens(access_token, refresh_token);

      try {
        const { data: me } = await api.get("/me");

        if (!me || !me.id) {
          throw new Error("Failed to get user information");
        }

        setUser({
          id: me.id,
          username: me.username,
          email: me.email,
          teams: me.teams || [],
        });

        router.replace("/apps");
      } catch (userError: any) {
        setLoginError("Login successful but failed to get user information");
        setLoading(false);
        return;
      }
    } catch (error: any) {
      let errorMessage = "Invalid email or password";

      if (error.response?.data?.error) {
        if (typeof error.response.data.error === "string") {
          errorMessage = error.response.data.error;
        } else if (error.response.data.error.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.response.data.error.details) {
          errorMessage = error.response.data.error.details;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.code === "ECONNABORTED"
      ) {
        errorMessage = "Network error. Please check your connection.";
      }

      setLoginError(errorMessage);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const clearFieldError = (field: string) => {
    if (field === "userOrEmail") {
      setUserOrEmailError("");
    } else if (field === "password") {
      setPasswordError("");
    }
  };

  const handleInputChange = (field: string, text: string) => {
    if (field === "userOrEmail") {
      setUserOrEmail(text);
      setUserOrEmailError("");
    } else if (field === "password") {
      setPassword(text);
      setPasswordError("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/company-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Log in</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please enter your details.
          </Text>
        </View>

        <View style={styles.form}>
          {loginError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username or Email</Text>
            <TextInput
              style={[styles.input, userOrEmailError && styles.inputError]}
              placeholder="Enter your username or email"
              value={userOrEmail}
              onChangeText={(text) => handleInputChange("userOrEmail", text)}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {userOrEmailError && (
              <Text style={styles.fieldErrorText}>{userOrEmailError}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              ref={passwordRef}
              style={[styles.input, passwordError && styles.inputError]}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={(text) => handleInputChange("password", text)}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            {passwordError && (
              <Text style={styles.fieldErrorText}>{passwordError}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Signing in..." : "Sign in"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.signupText}>
              Don't have an account?{" "}
              <Text style={styles.signupLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 16,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f2937",
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },
  fieldErrorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: "#dc2626",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  signupButton: {
    alignItems: "center",
  },
  signupText: {
    fontSize: 13,
    color: "#6b7280",
  },
  signupLink: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});

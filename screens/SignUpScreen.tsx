import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { api, apiPath } from "../services/api";
import { useAuth } from "../store/authStore";
import { useRouter } from "expo-router";

export const SignUpScreen = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const emailRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const setTokens = useAuth((state) => state.setTokens);
  const setUser = useAuth((state) => state.setUser);
  const router = useRouter();

  const handleSignup = async () => {
    setSignupError("");
    setUsernameError("");
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!username.trim()) {
      setUsernameError("Please enter username");
      hasError = true;
    }

    if (!email.trim()) {
      setEmailError("Please enter email");
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Please enter password");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      const response = await api.post(apiPath("/signup"), {
        username,
        email,
        password,
      });

      if (!response.data || !response.data.access_token) {
        throw new Error("Invalid response from server");
      }

      const { access_token, refresh_token } = response.data;

      if (!access_token || !refresh_token) {
        throw new Error("Missing authentication tokens");
      }

      setTokens(access_token, refresh_token);

      try {
        const { data: me } = await api.get(apiPath("/me"));

        if (!me || !me.id) {
          throw new Error("Failed to get user information");
        }

        const userTeams =
          me.teams && me.teams.length > 0 ? me.teams : ["LJY Soft"];

        setUser({
          id: me.id,
          username: me.username,
          email: me.email,
          teams: userTeams,
        });

        router.replace("/teams");
      } catch (error: any) {
        setSignupError("Signup successful but failed to get user information");
        setLoading(false);
        return;
      }
    } catch (error: any) {
      let errorMessage = "Signup failed. Please try again.";

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

      setSignupError(errorMessage);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleInputChange = (field: string, text: string) => {
    if (field === "username") {
      setUsername(text);
      setUsernameError("");
    } else if (field === "email") {
      setEmail(text);
      setEmailError("");
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
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>
            Create your account to get started.
          </Text>
        </View>

        <View style={styles.form}>
          {signupError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{signupError}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, usernameError && styles.inputError]}
              placeholder="Enter your username"
              value={username}
              onChangeText={(text) => handleInputChange("username", text)}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {usernameError && (
              <Text style={styles.fieldErrorText}>{usernameError}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, emailError && styles.inputError]}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => handleInputChange("email", text)}
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {emailError && (
              <Text style={styles.fieldErrorText}>{emailError}</Text>
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
              onSubmitEditing={handleSignup}
            />
            {passwordError && (
              <Text style={styles.fieldErrorText}>{passwordError}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.signupButton,
              loading && styles.signupButtonDisabled,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? "Creating account..." : "Create account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginLink}>Log in</Text>
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
  signupButton: {
    backgroundColor: "#10b981",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  signupButtonDisabled: {
    backgroundColor: "#9ca3af",
    shadowOpacity: 0.1,
  },
  signupButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  loginButton: {
    alignItems: "center",
  },
  loginText: {
    fontSize: 13,
    color: "#6b7280",
  },
  loginLink: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});

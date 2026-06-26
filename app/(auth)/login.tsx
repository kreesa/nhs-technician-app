import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    login,
    saveToken,
} from "../src/services/api";
import { getDeviceName } from "../src/services/device";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

    const validateEmail = (email: string) => {
        const regex = /\S+@\S+\.\S+/;
        return regex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 8;
    };

    const handleLogin = async () => {
    if (!validateEmail(email)) {
        Alert.alert("Invalid Email", "Please enter a valid email.");
        return;
    }

    if (!validatePassword(password)) {
        Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters."
        );
        return;
    }

    try {
        const device_name = await getDeviceName();

        const data = await login(email, password, device_name);

        await saveToken(data.token);

        router.push("/dashboard");
    } catch (error: any) {
        Alert.alert("Login failed", error.message);
    }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureText}
            style={{ flex: 1 }}
        />

        <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
        >
            <Ionicons
            name={secureText ? "eye-off" : "eye"}
            size={22}
            color="gray"
            />
        </TouchableOpacity>
        </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    },
});

const handleLogin = async () => {
  try {
    const data = await login(
      email,
      password,
      device_name,
    );

    await saveToken(data.token);

    Alert.alert("Success");
  } catch (error: any) {
    Alert.alert(
      "Error",
      error.message
    );
  }
};
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { TechColors } from "../src/components/theme";
import { TechButton } from "../src/components/ui";
import { useTechAuth } from "../src/context/TechAuthContext";
import { login } from "../src/services/api";
import { getDeviceName } from "../src/services/device";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const { technician, signIn } = useTechAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [secureText, setSecureText] = useState(true);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (pass: string) => pass.length >= 8;

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert("Invalid email");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert("Password must be 8+ characters");
      return;
    }

    try {
      setLoading(true);

      // const device_name = await getDeviceName();
      const device_name = 'technician-app';

      const data = await login(email, password, device_name);

      // console.log('Login response:', JSON.stringify(data, null, 2));
      // console.log("user:", data.user);

      // Update TechAuthContext + persist token & technician
      await signIn(data.token, data.user);

      // Store technician id if needed elsewhere
      await AsyncStorage.setItem("technician_id", String(data.user.id));

      router.replace("/dashboard");
    } catch (err: any) {
      Alert.alert("Login failed", err.message || "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="construct" size={28} color="#fff" />
        </View>

        <Text style={styles.appName}>Nepal Home Service</Text>

        <Text style={styles.welcomeSubtitle}>Your home, maintained on demand</Text>

        <Text style={styles.welcomeTitle}>Welcome Back</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="example@nhs.com"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
              style={styles.passwordInput}
            />

            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <Ionicons
                name={secureText ? "eye-off" : "eye"}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot Password</Text>
          </TouchableOpacity>

          <TechButton
            label='Sign In'
            onPress={handleLogin}
            loading={loading}
          />
        </View>

        <Text style={styles.termsText}>
          <Text style={styles.termsText}>By continuing you agree to our</Text>{" "}
          <Text style={styles.linkText}>Terms</Text> &{" "}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TechColors.brandBg,
  },

  headerSafeArea: {
    backgroundColor: TechColors.brandBg,
  },

  header: {
    backgroundColor: TechColors.brandBg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerTitle: {
    color: TechColors.white,
    fontSize: 18,
    fontWeight: "700",
  },

  headerLang: {
    color: TechColors.brandBg,
    fontSize: 13,
  },

  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: TechColors.brand,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: TechColors.brandDark,
    marginBottom: 4,
  },

  welcomeSubtitle: {
    fontSize: 14,
    color: TechColors.text2,
    marginBottom: 24,
  },

  welcomeTitle: {
    fontSize: 18,
    color: TechColors.text,
    marginBottom: 24,
  },

  card: {
    width: "100%",
    backgroundColor: TechColors.cardBg,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  tabRow: {
    flexDirection: "row",
    backgroundColor: TechColors.cardBg,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  tabActiveText: {
    color: TechColors.blue,
    fontWeight: "700",
    fontSize: 14,
  },

  tabInactiveText: {
    color: TechColors.text2,
    fontWeight: "600",
    fontSize: 14,
  },

  label: {
    fontSize: 13,
    color: TechColors.text,
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: TechColors.border,
    backgroundColor: "#FAFAF7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    color: TechColors.text,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: TechColors.border,
    backgroundColor: "#FAFAF7",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: TechColors.text,
  },

  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },

  forgotText: {
    color: TechColors.blue,
    fontSize: 13,
    fontWeight: "600",
  },

  termsText: {
    fontSize: 12,
    color: TechColors.text2,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
  },

  linkText: {
    color: TechColors.blue,
    fontWeight: "600",
  },

  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TechColors.red,
    position: "absolute",
    top: 0,
    right: 0,
  },
});

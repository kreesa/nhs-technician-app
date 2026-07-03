import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 30 }}>
        Welcome Technician
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/login")}
        style={{
          backgroundColor: "#007AFF",
          padding: 15,
          borderRadius: 8,
          width: "100%",
          marginBottom: 15,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
          Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
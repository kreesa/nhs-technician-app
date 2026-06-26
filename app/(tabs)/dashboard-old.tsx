import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { removeToken } from "../src/services/api";

export default function Dashboard() {
  const handleLogout = async () => {
    await removeToken();
    router.replace("/login");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        🎉 Dashboard
      </Text>

      <Text style={{ marginTop: 10 }}>
        You are successfully logged in
      </Text>

      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginTop: 20,
          backgroundColor: "red",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}
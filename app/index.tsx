import { View, SafeAreaView, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useTechAuth } from "./src/context/TechAuthContext";

export default function Index() {
  const { isLoggedIn } = useTechAuth();

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={styles.content} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1B4F72" },
  content: { flex: 1, backgroundColor: "#EFEDE7" },
});
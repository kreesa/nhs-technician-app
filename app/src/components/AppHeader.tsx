import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTechAuth } from "../context/TechAuthContext";
import { TechColors } from "./theme";
import { TechTopbar } from "./ui";

export function AppHeader() {
  const { technician, isLoggedIn } = useTechAuth();
  const insets = useSafeAreaInsets();

  console.log("isLoggedIn:", isLoggedIn);
  console.log("technician USER:", technician);

  return (
    <View
      style={{ paddingTop: insets.top, backgroundColor: TechColors.brandDark }}
    >
      <TechTopbar
        subtitle={isLoggedIn ? "Greeting-Online" : "Nepal Home Service"}
        title={
          isLoggedIn
            ? (technician?.name?.split(" ")[0] ?? "")
            : "Technician App"
        }
        right={
          <View style={styles.rightRow}>
            {isLoggedIn && (
              <TouchableOpacity style={{ position: "relative" }}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={TechColors.white}
                />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  notifDot: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TechColors.red,
  },
});

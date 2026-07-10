import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TechAuthProvider } from './src/context/TechAuthContext';
import { AppHeader } from './src/components/AppHeader';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TechAuthProvider>
          <View style={styles.container}>
            <AppHeader />
            <View style={styles.content}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </View>
      </TechAuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
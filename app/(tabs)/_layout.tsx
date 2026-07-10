import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import BottomBar from '../src/components/bottombar';
import { TechColors } from '../src/components/theme';

export default function AppLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TechColors.pageBg },
  content: { flex: 1 },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TechColors } from './theme';

const TABS = [
  {  key: 'dashboard',  label: 'Dashboard',  icon: 'home-outline',  iconActive: 'home',  path: '/dashboard',},
  {  key: 'jobs',  label: 'Jobs',  icon: 'clipboard-outline',  iconActive: 'clipboard',  path: '/job-lists',},
  {  key: 'profile',  label: 'Profile',  icon: 'person-outline',  iconActive: 'person',  path: '/profile',},
] as const;

export default function BottomBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.item}
            onPress={() => router.push(tab.path as any)}
            activeOpacity={0.7}
          >
            {isActive && <View style={styles.indicator} />}
            <Ionicons
              name={(isActive ? tab.iconActive : tab.icon) as any}
              size={22}
              color={isActive ? TechColors.brand : TechColors.text3}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.09)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: { fontSize: 10, fontWeight: '500', color: TechColors.text3 },
  labelActive: { color: TechColors.brand, fontWeight: '600' },
  indicator: {
    position: 'absolute',
    top: -10,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: TechColors.brand,
  },
});
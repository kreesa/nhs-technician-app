import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { router } from "expo-router";
import {
    Alert, KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import { TechColors, TechRadius, TechSpacing, TechStyles } from '../src/components/theme';
import { TechButton } from '../src/components/ui';
import { useTechAuth } from '../src/context/TechAuthContext';
import { techAuthApi } from '../src/services/api';
import { TechRootStackParamList } from '../src/types';

type Props = { navigation: NativeStackNavigationProp<TechRootStackParamList, 'Login'> };

export default function TechLoginScreen({ navigation }: Props) {
  const { signIn } = useTechAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const inputStyle = (key: string) => [
    TechStyles.input,
    focused === key && { borderColor: TechColors.brand },
  ];

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await techAuthApi.login({ email, password });
      await signIn(res.token, res.technician);
    } catch (err: any) {
      Alert.alert('Login failed', err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.logoBox}><Text style={{ fontSize: 34 }}>🔧</Text></View>
        <Text style={styles.appName}>NepalHomeService</Text>
        <Text style={styles.appSub}>Technician Portal</Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: TechColors.pageBg }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={TechStyles.card}>
          <Text style={styles.cardTitle}>Sign in to your account</Text>

          <View style={styles.field}>
            <Text style={TechStyles.fieldLabel}>Email address</Text>
            <TextInput
              style={inputStyle('email')}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={TechColors.text3}
            />
          </View>

          <View style={styles.field}>
            <Text style={TechStyles.fieldLabel}>Password</Text>
            <TextInput
              style={inputStyle('password')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              secureTextEntry
              placeholderTextColor={TechColors.text3}
            />
          </View>

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>

          <TechButton label="Sign in" onPress={handleLogin} loading={loading} />
        </View>

        <View style={styles.infoBox}>
          <Text style={{ fontSize: 14 }}>ℹ️</Text>
          <Text style={styles.infoText}>
            Technician accounts are created by the admin. Contact your administrator if you don't have access.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: TechColors.brandDark,
    paddingTop: 60, paddingBottom: 32,
    alignItems: 'center', gap: 8,
  },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: TechColors.brand,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  appName: { fontSize: 22, fontWeight: '700', color: TechColors.white },
  appSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  scroll: { padding: TechSpacing.lg, paddingBottom: 40, gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: '600', color: TechColors.text, marginBottom: 20 },
  field: { marginBottom: 12 },
  forgotRow: { alignItems: 'flex-end', marginBottom: 16 },
  link: { color: TechColors.brand, fontWeight: '500', fontSize: 13 },
  infoBox: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: TechColors.brandBg,
    borderRadius: TechRadius.lg, padding: 14,
  },
  infoText: { flex: 1, fontSize: 12, color: TechColors.text2, lineHeight: 18 },
});

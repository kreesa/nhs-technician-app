import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { TechColors, TechSpacing, TechStyles } from "../src/components/theme";
import {
  StatusDot,
  TechAvatar,
  TechButton,
  TechCard,
  TechPageHeader,
  TechRowKV,
} from "../src/components/ui";
import { useTechAuth } from "../src/context/TechAuthContext";
import { techProfileApi } from "../src/services/api";

export default function TechProfileScreen() {
  const { technician, signOut, updateTechnician } = useTechAuth();

  const [name, setName] = useState(technician?.full_name ?? "");
  const [phone, setPhone] = useState(technician?.phone ?? "");
  const [email, setEmail] = useState(technician?.email ?? "");
  const [available, setAvailable] = useState(technician?.is_available ?? true);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const inputStyle = (key: string) => [
    TechStyles.input,
    focused === key && { borderColor: TechColors.brand },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await techProfileApi.updateProfile({
        full_name: name,
        phone,
        email,
        is_available: available,
      });
      updateTechnician(updated);
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (val: boolean) => {
    try {
      await techProfileApi.setAvailability(val);
      setAvailable(val);
      updateTechnician({ is_available: val });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleSignOut = () =>
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);

  return (
    <View style={TechStyles.screen}>
      {/* PageHeader */}
      <TechPageHeader title="My Profile" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TechAvatar initials={initials} size={72} />
          <Text style={styles.nameText}>{technician?.full_name}</Text>
          <Text style={styles.specText}>
            {technician?.specialization ?? "Technician"}
          </Text>
          <View style={styles.ratingRow}>
            <Text style={{ color: TechColors.amber }}>★</Text>
            <Text style={{ fontSize: 13, color: TechColors.text2 }}>
              {technician?.rating ?? "—"} · {technician?.total_jobs ?? 0} jobs
              completed
            </Text>
          </View>
        </View>

        {/* Availability */}
        <TechCard>
          <View style={styles.availRow}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <StatusDot active={available} />
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: TechColors.text,
                  }}
                >
                  {available ? "Available" : "Unavailable"}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: TechColors.text3,
                    marginTop: 1,
                  }}
                >
                  {available
                    ? "Accepting new jobs"
                    : "Not receiving assignments"}
                </Text>
              </View>
            </View>
            <Switch
              value={available}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: '#CBD5E1', true: TechColors.green }}
              thumbColor={TechColors.white}
            />
          </View>
        </TechCard>

        {/* Personal Info */}
        <TechCard label="Personal information">
          {[
            {
              key: "name",
              label: "Full name",
              value: name,
              set: setName,
              type: "default",
            },
            {
              key: "email",
              label: "Email",
              value: email,
              set: setEmail,
              type: "email-address",
            },
            {
              key: "phone",
              label: "Phone",
              value: phone,
              set: setPhone,
              type: "phone-pad",
            },
          ].map(({ key, label, value, set, type }) => (
            <View key={key} style={styles.field}>
              <Text style={TechStyles.fieldLabel}>{label}</Text>
              <TextInput
                style={inputStyle(key)}
                value={value}
                onChangeText={set}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused(null)}
                keyboardType={type as any}
                autoCapitalize={key === "email" ? "none" : "words"}
                placeholderTextColor={TechColors.text3}
              />
            </View>
          ))}
        </TechCard>

        {/* Stats */}
        <TechCard label="Performance">
          <TechRowKV label="Rating" value={`${technician?.rating ?? "—"} ★`} />
          <TechRowKV
            label="Total jobs"
            value={String(technician?.total_jobs ?? 0)}
          />
          <TechRowKV
            label="Experience"
            value={`${technician?.experience_years ?? "—"} years`}
          />
          <TechRowKV
            label="Specialization"
            value={technician?.specialization ?? "—"}
            last
          />
        </TechCard>

        <TechButton
          label="Save changes"
          onPress={handleSave}
          loading={saving}
        />
        <TechButton
          label="Sign out"
          onPress={handleSignOut}
          variant="danger"
          style={{ marginTop: 0 }}
        />
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: TechSpacing.lg, paddingBottom: 40, gap: 12 },
  avatarSection: { alignItems: "center", paddingVertical: 16 },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: TechColors.text,
    marginTop: 10,
  },
  specText: { fontSize: 13, color: TechColors.text2, marginTop: 3 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  availRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  field: { marginBottom: 12 },
});

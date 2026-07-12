import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
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
import { Technician } from "../src/types";

export default function TechProfileScreen() {
  const { signOut } = useTechAuth();

  const [profile, setProfile] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res: any = await techProfileApi.getProfile();

        // Works whether request() returns profile directly
        // or { data: profile }
        const p: Technician = res.data ?? res;

        setProfile(p);
        setAvailable(p?.is_available ?? false);
      } catch (err) {
        console.error("Technician Profile Error:", err);
        Alert.alert("Error", "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleToggleAvailability = async (val: boolean) => {
    try {
      await techProfileApi.setAvailability(val);
      setAvailable(val);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <View style={TechStyles.screen}>
      <TechPageHeader title="My Profile" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <TechAvatar initials={initials} size={72} />

          <Text style={styles.nameText}>
            {loading ? "Loading..." : (profile?.full_name ?? "-")}
          </Text>

          <Text style={styles.specText}>
            {profile?.specialization ?? "Technician"}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={{ color: TechColors.amber }}>★</Text>
            <Text style={{ fontSize: 13, color: TechColors.text2 }}>
              {profile?.rating ?? "—"} · {profile?.total_jobs ?? 0} jobs completed
            </Text>
          </View>
        </View>

        {/* <TechCard>
          <View style={styles.availRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <StatusDot active={available} />
              <View>
                <Text style={styles.availLabel}>
                  {available ? "Available" : "Unavailable"}
                </Text>
                <Text style={styles.availSubtext}>
                  {available ? "Accepting new jobs" : "Not receiving assignments"}
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
        </TechCard> */}

        <TechCard label="Personal information">
          <View style={styles.field}>
            <Text style={TechStyles.fieldLabel}>Full name</Text>
            <TextInput
              style={[TechStyles.input, styles.inputDisabled]}
              value={profile?.name ?? ""}
              editable={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={TechStyles.fieldLabel}>Email</Text>
            <TextInput
              style={[TechStyles.input, styles.inputDisabled]}
              value={profile?.email ?? ""}
              editable={false}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={TechStyles.fieldLabel}>Phone</Text>
            <TextInput
              style={[TechStyles.input, styles.inputDisabled]}
              value={profile?.phone_number ?? ""}
              editable={false}
              keyboardType="phone-pad"
            />
          </View>
        </TechCard>

        <TechCard label="Performance">
          <TechRowKV label="Rating" value={`${profile?.rating ?? "—"} ★`} />
          <TechRowKV label="Total jobs" value={String(profile?.total_jobs ?? 0)} />
          <TechRowKV
            label="Experience"
            value={`${profile?.experience_years ?? "—"} years`}
          />
          <TechRowKV
            label="Specialization"
            value={profile?.specialization ?? "—"}
            last
          />
        </TechCard>

        <TechButton label="Sign out" onPress={handleSignOut} variant="danger" />

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: TechSpacing.lg,
    paddingBottom: 40,
    gap: 12,
  },

  avatarSection: {
    alignItems: "center",
    paddingVertical: 16,
  },

  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: TechColors.text,
    marginTop: 10,
  },

  specText: {
    fontSize: 13,
    color: TechColors.text2,
    marginTop: 3,
  },

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

  availLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: TechColors.text,
  },

  availSubtext: {
    fontSize: 11,
    color: TechColors.text3,
    marginTop: 1,
  },

  field: {
    marginBottom: 12,
  },

  inputDisabled: {
    backgroundColor: TechColors.border,
    color: TechColors.text2,
  },
});
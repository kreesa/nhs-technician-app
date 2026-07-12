import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  TechColors,
  TechRadius,
  TechSpacing,
  TechStyles,
} from "../src/components/theme";
import {
  SummaryTile,
  TechBadge,
  TechCard
} from "../src/components/ui";
import { useTechAuth } from "../src/context/TechAuthContext";
import { summaryApi, techJobApi, techProfileApi } from "../src/services/api";
import {
  AssignedJob,
  MonthlySummary
} from "../src/types";

function jobStatusVariant(status: string) {
  switch (status) {
    case "Completed":
      return "green";
    case "Work In Progress":
      return "blue";
    case "Technician Assigned":
      return "orange";
    case "On Hold":
      return "gray";
    default:
      return "amber";
  }
}

export default function DashboardScreen() {
  const { technician, updateTechnician, signOut } = useTechAuth();
  const [todayJobs, setTodayJobs] = useState<AssignedJob[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [available, setAvailable] = useState(technician?.is_available ?? true);
  const [refreshing, setRefreshing] = useState(false);
  const [availLoading, setAvailLoading] = useState(false);

  const initials =
    technician?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "T";

  const loadData = useCallback(async () => {
    try {
      const jobs = await techJobApi.getTodaysJobs();
      console.log("jobs:", jobs);
      setTodayJobs(jobs);

      const sum = await summaryApi.getMonthlySummary();
      console.log("summary:", sum);
      setSummary(sum);

    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Share GPS location while available
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    if (available) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            // distanceInterval: 30,
          },
          (loc) => {
            techProfileApi
              .updateGpsLocation(
                loc.coords.latitude,
                loc.coords.longitude,
              )
              .catch(() => {});
          },
        );
      })();
    }
    return () => {
      sub?.remove();
    };
  }, [available]);

  useEffect(() => {
    loadData();
  }, []);

  const toggleAvailability = async (val: boolean) => {
    setAvailLoading(true);
    try {
      await techProfileApi.setAvailability(val);
      setAvailable(val);
      updateTechnician({ is_available: val });
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setAvailLoading(false);
    }
  };

  const handleSignOut = () =>
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);

  // console.log("todayJobs:", todayJobs);
  // console.log("isArray:", Array.isArray(todayJobs));
  // console.log("length:", todayJobs?.length);

  return (
    <View style={TechStyles.screen}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor={TechColors.brand}
          />
        }
      >
        {/* Availability Toggle */}
        {/* 
        <TechCard>
          <View style={styles.availRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <StatusDot active={available} />
              <View>
                <Text style={{ fontSize: 15, fontWeight: '600', color: TechColors.text }}>
                  {available ? 'Available for jobs' : 'Not available'}
                </Text>
                <Text style={{ fontSize: 11, color: TechColors.text3, marginTop: 1 }}>
                  {available ? 'GPS sharing is active' : 'You won\'t receive new assignments'}
                </Text>
              </View>
            </View>
            <Switch
              value={available}
              onValueChange={toggleAvailability}
              disabled={availLoading}
              trackColor={{ false: '#CBD5E1', true: TechColors.green }}
              thumbColor={TechColors.white}
            />
          </View>
        </TechCard>
        */}
        {/* Monthly Summary */}
        {summary && (
          <View>
            <Text style={styles.sectionTitle}>This month</Text>
            <View style={styles.summaryRow}>
              <SummaryTile
                icon="✅"
                label="Jobs completed"
                value={String(summary.completed_jobs_count)}
                color={TechColors.brand}
              />
              <SummaryTile
                icon="✅"
                label="Working Hours"
                value={String(summary.working_hours)}
                color={TechColors.brand}
              />
              {/* <SummaryTile
                icon="✅"
                label="Working Minutes"
                value={String(summary.total_working_minutes)}
                color={TechColors.accent}
              /> */}
              {/* <SummaryTile
                icon="💰"
                label="Total earned"
                value={`NPR ${summary.total_earned.toLocaleString()}`}
                color={TechColors.brand}
              />
              <SummaryTile
                icon="🏦"
                label="Net payout"
                value={`NPR ${summary.net_payout.toLocaleString()}`}
                color={TechColors.accent}
              /> */}
            </View>
          </View>
        )}

        {/* Today's Jobs */}
        <Text style={styles.sectionTitle}>Today's schedule</Text>
        {todayJobs.length === 0 ? (
          <TechCard>
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📭</Text>
              <Text style={{ color: TechColors.text2, fontSize: 14 }}>
                No jobs scheduled today
              </Text>
            </View>
          </TechCard>
        ) : (
          todayJobs.map((item) => {
            const job = item.job;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.jobCard}
                onPress={() =>
                  router.push({
                    pathname: "/job-detail",
                    params: { jobId: String(job.id) },
                  })
                }
                activeOpacity={0.82}
              >
                <View style={styles.jobCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobCardTitle}>
                      Service #{job.service_category_id}
                    </Text>

                    <Text style={styles.jobCardSub} numberOfLines={1}>
                      {job.description}
                    </Text>
                  </View>

                  <TechBadge
                    label={job.status}
                    variant={jobStatusVariant(job.status) as any}
                  />
                </View>

                <View style={styles.jobCardMeta}>
                  <Text style={styles.jobMeta}>
                    🕐 {job.scheduled_time_slot}
                  </Text>

                  <Text style={styles.jobMeta}>📍 {job.site_address}</Text>
                </View>

                <View style={styles.jobCardFooter}>
                  <Text style={styles.jobFee}>
                    NPR {job.original_estimate_amount ?? "-"}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/job-detail",
                        params: { jobId: String(job.id) },
                      })
                    }
                  >
                    <Text style={styles.jobArrow}>View details →</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: TechSpacing.lg, paddingBottom: 32, gap: 12 },
  availRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TechColors.text2,
    marginBottom: 8,
    marginTop: 4,
  },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  jobCard: {
    backgroundColor: TechColors.cardBg,
    borderRadius: TechRadius.xl,
    padding: TechSpacing.lg,
    borderWidth: 0.5,
    borderColor: TechColors.border,
    gap: 10,
  },
  jobCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  jobCardTitle: { fontSize: 14, fontWeight: "600", color: TechColors.text },
  jobCardSub: { fontSize: 12, color: TechColors.text2, marginTop: 2 },
  jobCardMeta: { gap: 4 },
  jobMeta: { fontSize: 12, color: TechColors.text2 },
  jobCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  jobFee: { fontSize: 15, fontWeight: "700", color: TechColors.brand },
  jobArrow: { fontSize: 12, color: TechColors.brand, fontWeight: "500" },
  histRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: TechColors.border,
  },
});

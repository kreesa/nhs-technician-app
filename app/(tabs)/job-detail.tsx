import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { techJobApi } from "../src/services/api";
import { getAllowedTransitions, getStatusLabel, JobStatus } from "../src/constants/jobTransitions";
import OvertimeLogModal from "../src/components/OvertimeLogModal";
import {
  TechColors,
  TechRadius,
  TechSpacing,
  TechStyles,
} from "../src/components/theme";
import {
  TechPageHeader,
  SummaryTile,
  TechAvatar,
  TechBadge,
  TechCard,
  TechButton,
} from "../src/components/ui";


export default function JobDetailScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [overtimeModalVisible, setOvertimeModalVisible] = useState(false);

  const loadJob = useCallback(async () => {
    try {
      const response = await techJobApi.getJobDetail(Number(jobId));

      // Handles both:
      // { data: {...} }
      // {...}
      const data = response?.data ?? response;

      // If API returns an assignment object containing job
      setJob(data.job ?? data);
    } catch (e) {
      console.error("Load Job Error:", e);
      Alert.alert("Error", "Failed to load job details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const updateStatus = async (status: JobStatus) => {
    if (!job) return;

    try {
      setUpdating(true);

      await techJobApi.transitionJob(job.id, status);

      await loadJob();

      Alert.alert(
        "Success",
        `${getStatusLabel(status)} updated successfully.`
      );
    } catch (e) {
      console.error("Transition Error:", e);
      Alert.alert(
        "Error",
        "Failed to update job status."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.center}>
        <Text>Job not found.</Text>
      </View>
    );
  }

  const actions = getAllowedTransitions(
    job.status as JobStatus,
    job.material_required ?? false
  );


    return (
        <View style={TechStyles.screen}>
            {/* PageHeader */}
            <TechPageHeader title="Job Detail" onBack={() => router.back()} />

            <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true);
                    loadJob();
                }}
                tintColor={TechColors.brand}
                />
            }
            >
            {/* Job Info */}
            <Text style={styles.sectionTitle}>
                Job information
            </Text>

            <TechCard>
                <View style={styles.jobCardMeta}>
                <Text style={styles.jobMeta}>
                    🕐 {job.scheduled_time_slot}
                </Text>

                <Text style={styles.jobMeta}>
                    📍 {job.site_address}
                </Text>

                <Text style={styles.jobMeta}>
                    📅{" "}
                    {new Date(
                    job.scheduled_for
                    ).toDateString()}
                </Text>
                </View>

                <Text
                style={[
                    styles.jobCardTitle,
                    { marginTop: 14 },
                ]}
                >
                Description
                </Text>

                <Text style={styles.jobCardSub}>
                {job.description ||
                    "No description provided"}
                </Text>
            </TechCard>

            {/* Timeline */}
            <Text style={styles.sectionTitle}>
                Timeline
            </Text>

            <TechCard>
                <View style={styles.jobCardMeta}>
                <Text style={styles.jobMeta}>
                    Assigned:
                    {" "}
                    {job.created_at
                    ? new Date(
                        job.created_at
                        ).toLocaleString()
                    : "-"}
                </Text>

                <Text style={styles.jobMeta}>
                    Arrived:
                    {" "}
                    {job.arrived_at
                    ? new Date(
                        job.arrived_at
                        ).toLocaleString()
                    : "-"}
                </Text>

                <Text style={styles.jobMeta}>
                    Started:
                    {" "}
                    {job.started_at
                    ? new Date(
                        job.started_at
                        ).toLocaleString()
                    : "-"}
                </Text>

                <Text style={styles.jobMeta}>
                    Completed:
                    {" "}
                    {job.completed_at
                    ? new Date(
                        job.completed_at
                        ).toLocaleString()
                    : "-"}
                </Text>
                </View>
            </TechCard>

            {/* Actions */}
            {actions.length > 0 && (
                <>
                <Text style={styles.sectionTitle}>
                    Available actions
                </Text>

                <View style={{ gap: 10 }}>
                    {actions.map((status) => (
                    <TouchableOpacity
                        key={status}
                        style={styles.jobCard}
                        activeOpacity={0.82}
                        disabled={updating}
                        onPress={() =>
                        updateStatus(status)
                        }
                    >
                        <View
                        style={
                            styles.jobCardFooter
                        }
                        >
                        <Text
                            style={
                            styles.jobCardTitle
                            }
                        >
                            {getStatusLabel(
                            status
                            )}
                        </Text>

                        <Text
                            style={
                            styles.jobArrow
                            }
                        >
                            Continue →
                        </Text>
                        </View>
                    </TouchableOpacity>
                    ))}
                </View>
                </>
            )}
           


            {/* Overtime */}
            <TouchableOpacity >
              <TechButton label="Log Overtime" onPress={() => setOvertimeModalVisible(true)} />
            </TouchableOpacity>

            <OvertimeLogModal
              visible={overtimeModalVisible}
              jobId={jobId} // currentJobId - whatever variable holds the active job id on this screen
              onClose={() => setOvertimeModalVisible(false)}
              onSuccess={() => {/* refresh logs if you display them */}}
            />

            </ScrollView>
        </View>
        );
}


const styles = StyleSheet.create({
  scroll: {
    padding: TechSpacing.lg,
    paddingBottom: 32,
    gap: 12,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: TechColors.text2,
    marginBottom: 8,
    marginTop: 4,
  },

  jobCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: TechColors.text,
  },

  jobCardSub: {
    fontSize: 12,
    color: TechColors.text2,
    marginTop: 4,
    lineHeight: 18,
  },

  jobCardMeta: {
    gap: 6,
  },

  jobMeta: {
    fontSize: 12,
    color: TechColors.text2,
  },

  jobCard: {
    backgroundColor: TechColors.cardBg,
    borderRadius: TechRadius.xl,
    padding: TechSpacing.lg,
    borderWidth: 0.5,
    borderColor: TechColors.border,
  },

  jobCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  jobArrow: {
    fontSize: 12,
    color: TechColors.brand,
    fontWeight: "500",
  },
});
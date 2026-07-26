import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
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
  TechRowKV,
} from "../src/components/ui";


function confirmCompletion(onConfirm: () => void) {
  Alert.alert(
    "Confirm Completion",
    "Make sure you've logged your time before completing this job. Once completed, you won't be able to change the status.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Complete Job", onPress: onConfirm },
    ]
  );
}

export default function JobDetailScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [overtimeModalVisible, setOvertimeModalVisible] = useState(false);

  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

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

  const handleGenerateInvoice = async () => {
    setInvoiceLoading(true);
    try {
      const data = await techJobApi.generateInvoice(job.id);
      setInvoice(data);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to generate invoice.");
    } finally {
      setInvoiceLoading(false);
    }
  };                                

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

            {/* Live Tracking - technician's own map */}
            {(job.status === "en_route" ||
            job.status === "arrived" ||
            job.status === "started") && (
              <TechCard label={"live Tracker"}>
                <View style={styles.mapPh}>
                  <Text style={{ fontSize: 36, marginBottom: 8 }}>📍</Text>
                  <Text
                    style={{
                      color: TechColors.brand,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    You're marked as en route
                  </Text>
                  <Text
                    style={{
                      color: TechColors.brand,
                      fontSize: 11,
                      opacity: 0.8,
                      marginTop: 2,
                    }}
                  >
                    Sharing your live location with the customer
                  </Text>
                </View>
                <View style={{ padding: 14 }}>
                  <TechButton
                    label="Open Map & Navigate"
                    onPress={() =>
                      router.push({
                        pathname: "/en-route",
                        params: {
                          destLat: String(job.site_latitude),
                          destLng: String(job.site_longitude),
                          jobId: String(job.id),
                        },
                      })
                    }
                  />
                </View>
              </TechCard>
            )}

            {/* Invoice Generation */}
            {job.status === "completed" && (
            <TechCard label="Invoice">
              {!invoice ? (
                <View style={{ padding: 14 }}>
                  <TechButton
                    label="Generate Invoice"
                    onPress={handleGenerateInvoice}
                    loading={invoiceLoading}
                  />
                </View>
              ) : (
                <View style={{ padding: 14 }}>
                  {/* {Number(invoice.subtotal_labor) > 0 && ( */}
                    <TechRowKV label="Labor" value={`NPR ${Number(invoice.subtotal_labor).toLocaleString()}`} />
                  {/* )} */}
                  {/* {Number(invoice.subtotal_material) > 0 && ( */}
                    <TechRowKV label="Material" value={`NPR ${Number(invoice.subtotal_material).toLocaleString()}`} />
                  {/* )} */}
                  {/* {Number(invoice.subtotal_logistics) > 0 && ( */}
                    <TechRowKV label="Logistics" value={`NPR ${Number(invoice.subtotal_logistics).toLocaleString()}`} />
                  {/* )}
                  {Number(invoice.commission_amount) > 0 && ( */}
                    <TechRowKV label="Commission" value={`NPR ${Number(invoice.commission_amount).toLocaleString()}`} />
                  {/* )} 
                  {Number(invoice.tax_amount) > 0 && ( */}
                    <TechRowKV label="Tax" value={`NPR ${Number(invoice.tax_amount).toLocaleString()}`} />
                  {/* )} */}
                  {/* {Number(invoice.discount_amount) > 0 && ( */}
                    <TechRowKV label="Discount" value={`- NPR ${Number(invoice.discount_amount).toLocaleString()}`} />
                  {/* )} */}
                  <View
                    style={{
                      borderTopWidth: 1.5,
                      borderTopColor: TechColors.borderMd ?? "#D1D5DB",
                      marginTop: 8,
                      paddingTop: 10,
                    }}
                  >
                    <TechRowKV
                      label="Total"
                      value={`NPR ${Number(invoice.total_amount).toLocaleString()}`}
                      last
                    />
                  </View>

                  <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                    <TechButton
                      label="Edit / Add Item"
                      variant="danger"
                      onPress={() => {}}
                      disabled
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}
            </TechCard>
          )}

            {/* Confirmation Signature from Customer */}
            {job.status === "paid" && !job.signature_path && (
            <TechCard label="Confirmation Signature">
              <View style={{ padding: 14 }}>
                <Text style={{ fontSize: 13, color: TechColors.text2, marginBottom: 10 }}>
                  Please collect the customer's signature to complete this job.
                </Text>
                <TechButton
                  label="Get Signature"
                  onPress={() =>
                    router.push({
                      pathname: "/signature",
                      params: { serviceId: String(job.id) },
                    })
                  }
                />
              </View>
            </TechCard>
          )}




            {/* Log Time Duration - Overtime */}
            {(job.status === "arrived" ||
            job.status === "started" || 
            job?.status === "in_progress") && (
              <TechCard label="Log Time Duration">
                <TouchableOpacity>
                  <TechButton
                    label="Log Time Duration"
                    onPress={() => setOvertimeModalVisible(true)}
                  />
                </TouchableOpacity>
              </TechCard>
            )}

            <OvertimeLogModal
              visible={overtimeModalVisible}
              jobId={jobId}
              onClose={() => setOvertimeModalVisible(false)}
              onSuccess={() => {
                // refresh logs if needed
              }}
            />

            {/* Available Actions */}
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
                          status === "completed"
                            ? confirmCompletion(() => updateStatus(status))
                            : updateStatus(status)
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

   mapPh: {
    backgroundColor: "#d4e8c8",
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
});
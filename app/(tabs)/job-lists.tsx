import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { categoryApi, techJobApi } from "../src/services/api";
import { AssignedJob, ServiceCategory } from "../src/types";
import { TechButton, TechPageHeader, TechBadge } from "../src/components/ui";

type SortOption = "latest" | "oldest";

// Generic single-select field styled like a form input. Opens a modal list on tap.
function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { key: T; label: string }[];
  onChange: (val: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.key === value)?.label ?? "Select";

  return (
    <View style={styles.selectWrap}>
      <Text style={styles.selectLabel}>{label}</Text>
      <TouchableOpacity style={styles.selectBox} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={styles.selectValueText} numberOfLines={1}>
          {selectedLabel}
        </Text>
        <Text style={styles.selectChevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{label}</Text>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={styles.modalOption}
                onPress={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    opt.key === value && styles.modalOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {opt.key === value && <Text style={styles.modalCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// Compact toggle button (not a dropdown) for the two sort directions —
// both based on job.scheduled_for. Tapping flips latest <-> oldest.
function SortToggleButton({
  sortBy,
  onToggle,
}: {
  sortBy: SortOption;
  onToggle: () => void;
}) {
  return (
    <View style={styles.sortToggleWrap}>
      <Text style={styles.selectLabel}>Sort</Text>
      <TouchableOpacity style={styles.sortToggleBtn} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.sortToggleText}>{sortBy === "latest" ? "Latest" : "Oldest"}</Text>
        <Text style={styles.sortToggleArrow}>{sortBy === "latest" ? "↓" : "↑"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const ACTIVE_STATUSES = [
    "assigned",
    "en_route",
    "arrived",
    "started",
    "awaiting_approval",
    "awaiting_material",
    "in_progress",
    "approved_proxy",
    "rejected_proxy",
    "material_ready",
    "invoiced",
];
const COMPLETED_STATUSES = ["completed", "paid"];

export default function TechJobsScreen() {
  const [jobs, setJobs] = useState<AssignedJob[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const categoryOptions = useMemo(
    () => [
      { key: "all", label: "All" },
      ...categories.map((cat) => ({
        key: String(cat.id),
        label: cat.name,
      })),
    ],
    [categories]
  );

  const JOB_STATUSES = [
    "assigned",
    "en_route",
    "arrived",
    "started",
    "in_progress",
    "completed",
    "invoiced",
    "paid",
    "cancelled",
    ] as const;

    const formatStatusLabel = (status: string) =>
    status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    // Fixed status list — not derived from jobs, so all options always show.
    const statusOptions = useMemo(() => {
    return [
        { key: "all", label: "All" },
        ...JOB_STATUSES.map((s) => ({ key: s, label: formatStatusLabel(s) })),
    ];
    }, []);

  // Raw status values pulled straight from the jobs list — no grouping/mapping.
//   const statusOptions = useMemo(() => {
//     const unique = Array.from(new Set(jobs.map((j) => j.status))).filter(Boolean);
//     return [
//       { key: "all", label: "All" },
//       ...unique.map((s) => ({ key: s, label: s })),
//     ];
//   }, [jobs]);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const jobsRes: AssignedJob[] = (await techJobApi.getAllJobs()) ?? [];

      const categoryResponse: any = await categoryApi.getCategories();
      const categoriesRes: ServiceCategory[] = categoryResponse.data ?? [];

      setJobs(jobsRes);
      setCategories(categoriesRes);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load jobs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const categoryNameById = useMemo(() => {
    const map: Record<number, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  const activeCount = useMemo(
    () => jobs.filter((j) => ACTIVE_STATUSES.includes(j.status)).length,
    [jobs]
  );

  const completedCount = useMemo(
    () => jobs.filter((j) => COMPLETED_STATUSES.includes(j.status)).length,
    [jobs]
  );

  const filteredAndSortedJobs = useMemo(() => {
    const fromTime = dateFrom?.getTime() ?? null;
    const toTime =
      dateTo != null
        ? new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59).getTime()
        : null;

    const filtered = jobs.filter((job) => {
      if (categoryFilter !== "all" && String(job.service_category_id) !== categoryFilter) {
        return false;
      }

      if (statusFilter !== "all" && job.status !== statusFilter) {
        return false;
      }

      if (fromTime || toTime) {
        const scheduledTime = job.scheduled_for ? new Date(job.scheduled_for).getTime() : null;
        if (!scheduledTime || isNaN(scheduledTime)) return false;
        if (fromTime && scheduledTime < fromTime) return false;
        if (toTime && scheduledTime > toTime) return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aTime = new Date(a.scheduled_for ?? 0).getTime();
      const bTime = new Date(b.scheduled_for ?? 0).getTime();
      return sortBy === "latest" ? bTime - aTime : aTime - bTime;
    });

    return sorted;
  }, [jobs, categoryFilter, statusFilter, sortBy, dateFrom, dateTo]);

  const renderItem = ({ item }: { item: AssignedJob }) => {
    const categoryName = categoryNameById[item.service_category_id] ?? "Service";

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() =>
          router.push({
            pathname: "/job-detail",
            params: { jobId: item.id },
          })
        }
        activeOpacity={0.8}
      >
        <View style={styles.jobHeader}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.jobTitle}>Service - {categoryName}</Text>
          </View>

          <TechBadge label={item.status} />
        </View>

        <Text style={styles.jobDescription}>{item.description}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>📅 Scheduled Date</Text>
          <Text style={styles.metaValue}>{item.scheduled_for?.split("T")[0] ?? "—"}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>🆔 Job No.</Text>
          <Text style={styles.metaValue}>#{item.id}</Text>
        </View>

        <TechButton label="View Details" variant='outline' onPress={() =>
          router.push({
            pathname: "/job-detail",
            params: { jobId: String(item.id) },
          })
        } loading={loading} />

      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TechPageHeader title="My Jobs" onBack={() => router.back()} />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active / Completed counts */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryValue}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryTile}>
          <Text style={styles.summaryValue}>{completedCount}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      {/* Category + Status + Sort toggle, all in one row */}
      <View style={styles.selectRow}>
        <SelectField
          label="Service Category"
          value={categoryFilter}
          options={categoryOptions}
          onChange={setCategoryFilter}
        />

        <SelectField
          label="Status"
          value={statusFilter}
          options={statusOptions}
          onChange={setStatusFilter}
        />

        <SortToggleButton
          sortBy={sortBy}
          onToggle={() => setSortBy((prev) => (prev === "latest" ? "oldest" : "latest"))}
        />
      </View>

      {/* Date range filter */}
      <View style={styles.dateRow}>
        <View style={styles.dateInputWrap}>
          <Text style={styles.dateLabel}>Scheduled From</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowFromPicker(true)}>
            <Text>{dateFrom ? formatDate(dateFrom) : "Select date"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateInputWrap}>
          <Text style={styles.dateLabel}>Scheduled To</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowToPicker(true)}>
            <Text>{dateTo ? formatDate(dateTo) : "Select date"}</Text>
          </TouchableOpacity>
        </View>

        {(dateFrom || dateTo) && (
          <TouchableOpacity
            style={styles.clearDatesBtn}
            onPress={() => {
              setDateFrom(null);
              setDateTo(null);
            }}
          >
            <Text style={styles.clearDatesText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredAndSortedJobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyText}>You don't have any jobs matching these filters.</Text>
          </View>
        }
      />

      {/* Date Pickers */}
      {showFromPicker && (
        <DateTimePicker
          value={dateFrom ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) setDateFrom(selectedDate);
          }}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={dateTo ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) setDateTo(selectedDate);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  errorBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  errorText: {
    color: "#B91C1C",
    flex: 1,
    marginRight: 10,
  },

  retryText: {
    color: "#B91C1C",
    fontWeight: "700",
  },

  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },

  summaryTile: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  selectRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },

  selectWrap: {
    flex: 1,
  },

  selectLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },

  selectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  selectValueText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 6,
  },

  selectChevron: {
    color: "#6B7280",
    fontSize: 12,
  },

  sortToggleWrap: {},

  sortToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },

  sortToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  sortToggleArrow: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modalSheet: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 8,
  },

  modalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  modalOptionText: {
    fontSize: 15,
    color: "#111827",
  },

  modalOptionTextActive: {
    fontWeight: "700",
  },

  modalCheck: {
    color: "#111827",
    fontWeight: "700",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },

  dateInputWrap: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },

  dateInput: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    justifyContent: "center",
    minHeight: 38,
  },

  clearDatesBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#ECEFF3",
  },

  clearDatesText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  jobCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  jobDescription: {
    marginTop: 10,
    color: "#6B7280",
    lineHeight: 20,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  metaLabel: {
    color: "#6B7280",
    fontSize: 13,
  },

  metaValue: {
    fontWeight: "600",
    fontSize: 13,
  },

  emptyState: {
    alignItems: "center",
    paddingTop: 80,
  },

  emptyEmoji: {
    fontSize: 42,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyText: {
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
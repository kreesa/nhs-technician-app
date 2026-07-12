export type JobStatus =
  | "assigned"
  | "en_route"
  | "arrived"
  | "started"
  | "awaiting_approval"
  | "approved_proxy"
  | "rejected_proxy"
  | "awaiting_material"
  | "material_ready"
  | "in_progress"
  | "completed"
  | "invoiced"
  | "paid"
  | "cancelled";

export const JOB_TRANSITIONS: Record<
  JobStatus,
  JobStatus[]
> = {
  assigned: ["en_route", "cancelled"],
  en_route: ["arrived", "cancelled"],
  arrived: ["started", "cancelled"],

  started: [
    "in_progress",
    "completed",
    "cancelled",
  ],

  // awaiting_approval: [
  //   "approved_proxy",
  //   "rejected_proxy",
  //   "cancelled",
  // ],

  // approved_proxy: [
  //   "in_progress",
  //   "awaiting_material",
  // ],

  // rejected_proxy: ["cancelled"],

  // awaiting_material: [
  //   "material_ready",
  //   "cancelled",
  // ],

  // material_ready: [
  //   "in_progress",
  //   "cancelled",
  // ],

  in_progress: [
    "completed",
    // "awaiting_approval",
    // "awaiting_material",
    "cancelled",
  ],

  completed: ["invoiced"],
  // invoiced: ["paid"],
  paid: [],
  cancelled: [],
};

export function getAllowedTransitions(
  status: JobStatus,
  materialRequired = false
): JobStatus[] {
  if (status === "started" && materialRequired) {
    return [
      "awaiting_approval",
      "awaiting_material",
      "in_progress",
      "completed",
      "cancelled",
    ];
  }

  return JOB_TRANSITIONS[status] ?? [];
}

export function getStatusLabel(
  status: string
) {
  switch (status) {
    case "invoiced":
      return "Generate Invoice";
    default:
      return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (c) =>
          c.toUpperCase()
        );
}
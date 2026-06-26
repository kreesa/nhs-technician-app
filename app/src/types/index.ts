// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface TechLoginPayload {
  email: string;
  password: string;
}

export interface TechAuthResponse {
  token: string;
  technician: Technician;
}

// ─── Technician ───────────────────────────────────────────────────────────────
export interface Technician {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  specialization?: string;
  experience_years?: number;
  rating?: number;
  total_jobs?: number;
  is_available?: boolean;
  current_latitude?: number;
  current_longitude?: number;
  created_at?: string;
}

// ─── Job / Assignment ─────────────────────────────────────────────────────────
export type JobStatus =
  | 'Request received'
  | 'Technician Assigned'
  | 'Work In Progress'
  | 'On Hold'
  | 'Completed';

export type OnsiteStatus =
  | 'Diagnosing issue'
  | 'Waiting for Material'
  | 'Work in Progress'
  | 'Complete';

export interface CustomerInfo {
  id: number;
  full_name: string;
  phone: string;
  service_address: string;
  latitude: number;
  longitude: number;
}

export interface AssignedJob {
  id: number;                       // service_request id
  assignment_id: number;
  customer: CustomerInfo;
  service_category: string;
  service_subcategory: string;
  problem_description: string;
  problem_images?: string[];
  service_location: string;
  latitude: number;
  longitude: number;
  requested_date: string;
  requested_timeslot: string;
  scheduled_timeslot: string;
  technician_service_fee: number;
  service_status: JobStatus;
  technician_en_route: boolean;
  technician_arrival_onsite: boolean;
  need_assistance: boolean;
  send_quotation_to_customer: boolean;
  agreed_to_quotation: boolean;
  total_payable_amount?: number;
  payment_method?: string;
  customer_confirmation_signature?: string;
}

// ─── Onsite Progress ──────────────────────────────────────────────────────────
export interface OnsiteProgress {
  id?: number;
  service_id: number;
  technician_id: number;
  current_job_status: OnsiteStatus;
  technician_note: string;
  need_assistance: boolean;
}

// ─── Material ─────────────────────────────────────────────────────────────────
export interface Material {
  id: number;
  name: string;
  unit?: string;
  estimated_price?: number;
}

export interface MaterialRequest {
  service_id: number;
  fee_type: 'Material Cost';
  material_type: number;  // material id
  quantity?: number;
}

// ─── Monthly Summary ──────────────────────────────────────────────────────────
export interface MonthlySummary {
  jobs_completed: number;
  total_earned: number;
  net_payout: number;
  month: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type TechRootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  JobDetail: { jobId: number };
  OnsiteProgress: { jobId: number };
  MaterialRequest: { jobId: number };
  Signature: { jobId: number };
  TechProfile: undefined;
};

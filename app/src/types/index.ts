// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface TechLoginPayload {
  email: string;
  password: string;
}

export interface TechAuthResponse {
  token: string;
  technician: Technician;
}

// ─── Service Categories ───────────────────────────────────────────────────────
export interface ServiceCategory {
  id: number;
  name: string;
  icon?: string;
  execution_mode: string;
}

export interface ServiceSubCategory {
  id: number;
  name: string;
  service_category_id: number;
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
  current_site_latitude?: number;
  current_site_longitude?: number;
  created_at?: string;
}

export interface CustomerInfo {
  id: number;
  full_name: string;
  phone: string;
  service_address: string;
  site_latitude: number;
  site_longitude: number;
}

export interface AssignedJob {
  id: number; // service_request id
  assignment_id: number;
  customer_id: CustomerInfo;
  service_category_id: string;
  service_subcategory_id: string;
  description: string;
  problem_images?: string[];
  site_address: string;
  site_latitude: number;
  site_longitude: number;
  scheduled_for: string;
  scheduled_time_slot: string;
  original_estimated_amount: number;
  status: JobStatus;
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
  fee_type: "Material Cost";
  material_type: number; // material id
  quantity?: number;
}

// ─── InvoiceSummary ──────────────────────────────────────────────────────────
export interface InvoiceSummary {
  invoice_status: "draft" | "finalized" | "paid"; // adjust if there are more states
  subtotal_labor: string;
  subtotal_material: string;
  subtotal_logistics: string;
  commission_amount: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
}

// ─── Monthly Summary ──────────────────────────────────────────────────────────
export interface MonthlySummary {
  month_start: string;
  completed_jobs_count: number;
  total_working_minutes: number;
  working_hours: number;
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


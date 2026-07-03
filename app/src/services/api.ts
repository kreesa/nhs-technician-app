import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import {
  AssignedJob,
  Material,
  MaterialRequest,
  MonthlySummary,
  OnsiteProgress,
  TechAuthResponse,
  TechLoginPayload,
  Technician,
} from "../types";

/* ===========================================================
   CONFIG
=========================================================== */

export const BASE_URL = "https://nepalhomeservice.com";

/* ===========================================================
   TOKEN STORAGE
=========================================================== */

export async function saveToken(token: string) {
  await SecureStore.setItemAsync("auth_token", token);
}

export async function getToken() {
  return SecureStore.getItemAsync("auth_token");
}

export async function removeToken() {
  return SecureStore.deleteItemAsync("auth_token");
}

/* ===========================================================
   COMMON REQUEST
=========================================================== */

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });


  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
}

/* ===========================================================
   AUTH
=========================================================== */

export const techAuthApi = {
  login: async (payload: TechLoginPayload): Promise<TechAuthResponse> => {
    const data = await request<TechAuthResponse>("/api/technician/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Save token automatically
    if ((data as any).token) {
      await saveToken((data as any).token);
    }

    return data;
  },
};

export async function login(
  email: string,
  password: string,
  device_name: string,
) {
  const data = await request<any>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      device_name,
    }),
  });

  if (data.token) {
    await saveToken(data.token);
  }

  return data;
}

export async function logout() {
  try {
    await request("/api/auth/logout", {
      method: "POST",
    });
  } catch {}

  await removeToken();
}

/* ===========================================================
   PROFILE
=========================================================== */

export const techProfileApi = {
  getProfile: (): Promise<Technician> => request("/api/technician/profile"),

  updateProfile: (data: Partial<Technician>): Promise<Technician> =>
    request("/api/technician/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  setAvailability: (is_available: boolean): Promise<Technician> =>
    request("/api/technician/availability", {
      method: "PUT",
      body: JSON.stringify({
        is_available,
      }),
    }),

  updateGpsLocation: (
    site_latitude: number,
    site_longitude: number,
  ): Promise<void> =>
    request("/api/technician/gps-location", {
      method: "PUT",
      body: JSON.stringify({
        site_latitude,
        site_longitude,
      }),
    }),
};

/* ===========================================================
   JOBS
=========================================================== */
// technician_id
const getUserId = async (): Promise<string | null> => {
  return AsyncStorage.getItem("user_id");
};

export const techJobApi = {

  getTodaysJobs: async (): Promise<AssignedJob[]> =>{
    const userId = await getUserId();
    const response = await request(`/api/technicians/${userId}/assigned-jobs`);
    return response.data;
  },

  getPastJobs: async (): Promise<AssignedJob[]> =>{
    const userId = await getUserId();
    return request(`/api/technicians/${userId}/assigned-jobs`);
  },

  getJobDetail: (jobId: number): Promise<AssignedJob> =>
    request(`/api/jobs/${jobId}`),

  transitionJob: (
    jobId: number,
    status: JobStatus
  ): Promise<AssignedJob> =>
    request(`/api/jobs/${jobId}/transition`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  uploadSignature: (
    jobId: number,
    signatureUrl: string,
  ): Promise<AssignedJob> =>
    request(`/api/service-requests/${jobId}/signature`, {
      method: "PUT",
      body: JSON.stringify({
        customer_confirmation_signature: signatureUrl,
      }),
    }),
};

/* ===========================================================
   OVERTIME
=========================================================== */
interface OvertimeEntry {
  start_time: string; // "10:00 AM"
  end_time: string;   // "12:00 PM"
}

export async function addOvertimeLog(
  jobId: string | number,
  dateKey: string,
  entries: OvertimeEntry[]
) {
  return request(`/api/jobs/${jobId}/logs`, {
    method: 'POST',
    body: JSON.stringify({
      working_hours_log: {
        [dateKey]: entries,
      },
    }),
  });
  // ^ adjust this call to match your actual request() signature
  //   (e.g. if it takes (endpoint, method, body) as separate args instead)
}

/* ===========================================================
   ONSITE PROGRESS
=========================================================== */

export const onsiteApi = {
  getProgress: (jobId: number): Promise<OnsiteProgress[]> =>
    request(`/api/technician/jobs/${jobId}/progress`),

  saveProgress: (data: OnsiteProgress): Promise<OnsiteProgress> =>
    request("/api/technician/onsite-progress", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateLatestProgress: (
    jobId: number,
    data: Partial<OnsiteProgress>,
  ): Promise<OnsiteProgress> =>
    request(`/api/technician/jobs/${jobId}/progress/latest`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

/* ===========================================================
   MATERIALS
=========================================================== */

export const materialApi = {
  getAllMaterials: (): Promise<Material[]> => request("/api/materials"),

  requestMaterial: (data: MaterialRequest): Promise<{ message: string }> =>
    request("/api/material-requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

/* ===========================================================
   MONTHLY SUMMARY
=========================================================== */

export const summaryApi = {
    getMonthlySummary: (): Promise<MonthlySummary> =>
    request("api/technicians/3/monthly-summary"),

  // getMonthlySummary: async (): Promise<MonthlySummary[]> =>{
  //   const userId = await AsyncStorage.getItem("user_id");
  //   return request(`/api/technicians/${userId}/monthly-summary`);
  // },
// getMonthlySummary: async (): Promise<MonthlySummary> => {
//   const userId = await AsyncStorage.getItem("user_id");

//   const response = await request(
//     `/api/technicians/${userId}/monthly-summary`
//   );

//   return response.data;
// },
};

/* ===========================================================
   FILE UPLOAD
=========================================================== */

export const techUploadApi = {
  uploadImage: async (
    uri: string,
    type = "image/jpeg",
  ): Promise<{ url: string }> => {
    const token = await getToken();

    const formData = new FormData();

    formData.append("file", {
      uri,
      type,
      name: `upload_${Date.now()}.jpg`,
    } as any);

    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  },
};

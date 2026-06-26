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
} from "../src/types";

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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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

  const response = await fetch(
    `${BASE_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `HTTP ${response.status}`
    );
  }

  return data;
}

/* ===========================================================
   AUTH
=========================================================== */

export const techAuthApi = {
  login: async (
    payload: TechLoginPayload
  ): Promise<TechAuthResponse> => {
    const data = await request<TechAuthResponse>(
      "/api/technician/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

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
  device_name: string
) {
  const data = await request<any>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        device_name,
      }),
    }
  );

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
  getProfile: (): Promise<Technician> =>
    request("/api/technician/profile"),

  updateProfile: (
    data: Partial<Technician>
  ): Promise<Technician> =>
    request("/api/technician/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  setAvailability: (
    is_available: boolean
  ): Promise<Technician> =>
    request("/api/technician/availability", {
      method: "PUT",
      body: JSON.stringify({
        is_available,
      }),
    }),

  updateGpsLocation: (
    latitude: number,
    longitude: number
  ): Promise<void> =>
    request("/api/technician/gps-location", {
      method: "PUT",
      body: JSON.stringify({
        latitude,
        longitude,
      }),
    }),
};

/* ===========================================================
   JOBS
=========================================================== */

export const techJobApi = {
  getTodaysJobs: (): Promise<AssignedJob[]> =>
    request("/api/technician/jobs/today"),

  getPastJobs: (): Promise<AssignedJob[]> =>
    request("/api/technician/jobs/history"),

  getJobDetail: (
    jobId: number
  ): Promise<AssignedJob> =>
    request(`/api/technician/jobs/${jobId}`),

  acceptJob: (
    jobId: number
  ): Promise<AssignedJob> =>
    request(`/api/technician/jobs/${jobId}/accept`, {
      method: "PUT",
    }),

  setEnRoute: (
    jobId: number
  ): Promise<AssignedJob> =>
    request(`/api/service-requests/${jobId}/en-route`, {
      method: "PUT",
      body: JSON.stringify({
        technician_en_route: true,
      }),
    }),

  setArrived: (
    jobId: number
  ): Promise<AssignedJob> =>
    request(`/api/service-requests/${jobId}/arrived`, {
      method: "PUT",
      body: JSON.stringify({
        technician_arrival_onsite: true,
      }),
    }),

  sendQuotation: (
    jobId: number
  ): Promise<AssignedJob> =>
    request(`/api/service-requests/${jobId}/send-quotation`, {
      method: "PUT",
      body: JSON.stringify({
        send_quotation_to_customer: true,
      }),
    }),

  uploadSignature: (
    jobId: number,
    signatureUrl: string
  ): Promise<AssignedJob> =>
    request(`/api/service-requests/${jobId}/signature`, {
      method: "PUT",
      body: JSON.stringify({
        customer_confirmation_signature:
          signatureUrl,
      }),
    }),
};

/* ===========================================================
   ONSITE PROGRESS
=========================================================== */

export const onsiteApi = {
  getProgress: (
    jobId: number
  ): Promise<OnsiteProgress[]> =>
    request(`/api/technician/jobs/${jobId}/progress`),

  saveProgress: (
    data: OnsiteProgress
  ): Promise<OnsiteProgress> =>
    request("/api/technician/onsite-progress", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateLatestProgress: (
    jobId: number,
    data: Partial<OnsiteProgress>
  ): Promise<OnsiteProgress> =>
    request(
      `/api/technician/jobs/${jobId}/progress/latest`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),
};

/* ===========================================================
   MATERIALS
=========================================================== */

export const materialApi = {
  getAllMaterials: (): Promise<Material[]> =>
    request("/api/materials"),

  requestMaterial: (
    data: MaterialRequest
  ): Promise<{ message: string }> =>
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
    request("/api/technician/summary/monthly"),
};

/* ===========================================================
   FILE UPLOAD
=========================================================== */

export const techUploadApi = {
  uploadImage: async (
    uri: string,
    type = "image/jpeg"
  ): Promise<{ url: string }> => {
    const token = await getToken();

    const formData = new FormData();

    formData.append(
      "file",
      {
        uri,
        type,
        name: `upload_${Date.now()}.jpg`,
      } as any
    );

    const response = await fetch(
      `${BASE_URL}/api/upload`,
      {
        method: "POST",
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  },
};
import { supabase } from "./supabase";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const normalizeEndpoint = (endpoint) => {
  if (endpoint.startsWith("/api")) return endpoint;
  return `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

export const apiRequest = async (endpoint, options = {}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${normalizeEndpoint(endpoint)}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg =
      data?.error || data?.message || `API Error: ${response.status}`;

    console.error("API Error:", {
      endpoint,
      status: response.status,
      message: errorMsg,
    });

    throw new Error(errorMsg);
  }

  return { data };
};

export const api = {
  get: (endpoint) =>
    apiRequest(endpoint, {
      method: "GET",
    }),

  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE",
    }),

  upload: (endpoint, formData) =>
    apiRequest(endpoint, {
      method: "POST",
      body: formData,
    }),
};

export default api;
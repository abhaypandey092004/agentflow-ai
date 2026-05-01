const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("access_token");
};

const normalizeEndpoint = (endpoint) => {
  if (endpoint.startsWith("/api")) return endpoint;
  return `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${normalizeEndpoint(endpoint)}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 || response.status === 403) {
    console.warn("Authentication failure. Redirecting to login...");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login?expired=true";
    }
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `API Error: ${response.status}`;
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
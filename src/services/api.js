import { auth } from "../firebase";

export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5001/inventory-app-19292/us-central1/api";

/**
 * Sends an authenticated HTTP request to the backend Functions API.
 * Automatically injects the Firebase ID token in the Authorization header.
 *
 * @param {string} endpoint - API path (e.g. '/products' or '/users')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} Parsed JSON response body
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Ensure Firebase Auth is initialized before reading currentUser
  if (!auth.currentUser && typeof auth.authStateReady === "function") {
    try {
      await auth.authStateReady();
    } catch {
      // ignore initialization check failure; proceed with whatever state exists
    }
  }

  const headers = { ...(options.headers || {}) };

  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Failed to retrieve Firebase ID token:", err);
    }
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  if (
    options.body &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      // ignored
    }
  } else {
    try {
      const text = await response.text();
      data = text ? { message: text } : null;
    } catch {
      // ignored
    }
  }

  if (!response.ok) {
    const message =
      data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: "POST", body }),
  put: (endpoint, body, options = {}) =>
    apiRequest(endpoint, { ...options, method: "PUT", body }),
  delete: (endpoint, options = {}) =>
    apiRequest(endpoint, { ...options, method: "DELETE" }),
  downloadCSV: downloadInventoryCSV,
  checkAlerts: checkLowStockAlerts,
};

/**
 * Downloads the inventory CSV report directly from the standalone exportInventoryCSV Cloud Function.
 */
export async function downloadInventoryCSV() {
  if (!auth.currentUser && typeof auth.authStateReady === "function") {
    try {
      await auth.authStateReady();
    } catch {
      // ignored
    }
  }

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  const exportUrl = `${baseUrl}/exportInventoryCSV`;

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(exportUrl, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Export failed with status ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.message) errorMsg = errData.message;
    } catch {
      // ignored
    }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = downloadUrl;
  a.download = `inventory-report-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Calls the standalone checkLowStockAlerts Cloud Function microservice.
 * Scans products for low/out-of-stock items, logs an audit alert, and returns a detailed breakdown.
 */
export async function checkLowStockAlerts() {
  if (!auth.currentUser && typeof auth.authStateReady === "function") {
    try {
      await auth.authStateReady();
    } catch {
      // ignored
    }
  }

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  const alertUrl = `${baseUrl}/checkLowStockAlerts`;

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(alertUrl, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Alert scan failed with status ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.message) errorMsg = errData.message;
    } catch {
      // ignored
    }
    throw new Error(errorMsg);
  }

  return await response.json();
}

export default api;

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
  recordStockMovement: recordStockMovement,
  getStockMovements: getStockMovements,
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

/**
 * Calls the standalone recordStockMovement Cloud Function microservice to record an atomic inventory movement.
 *
 * @param {Object} movementData - { productId, type, quantity, targetQuantity, reason, referenceNumber }
 * @returns {Promise<any>}
 */
export async function recordStockMovement(movementData) {
  if (!auth.currentUser && typeof auth.authStateReady === "function") {
    try {
      await auth.authStateReady();
    } catch {
      // ignored
    }
  }

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  const movementUrl = `${baseUrl}/recordStockMovement`;

  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(movementUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(movementData),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // ignored
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Stock movement failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Retrieves the Stock Movement & Audit Ledger history from the standalone microservice.
 *
 * @param {Object} params - { productId, type, limit }
 * @returns {Promise<{ success: boolean, summary: Object, data: Array }>}
 */
export async function getStockMovements(params = {}) {
  if (!auth.currentUser && typeof auth.authStateReady === "function") {
    try {
      await auth.authStateReady();
    } catch {
      // ignored
    }
  }

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
  const baseUrl = API_URL.replace(/\/api\/?$/, "");

  const queryParts = [];
  if (params.productId) queryParts.push(`productId=${encodeURIComponent(params.productId)}`);
  if (params.type) queryParts.push(`type=${encodeURIComponent(params.type)}`);
  if (params.limit) queryParts.push(`limit=${encodeURIComponent(params.limit)}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const movementUrl = `${baseUrl}/recordStockMovement${queryString}`;

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(movementUrl, {
    method: "GET",
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // ignored
  }

  if (!response.ok) {
    const errorMsg = data?.message || `Failed to fetch stock movements: ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default api;


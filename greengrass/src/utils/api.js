// src/api/api.js

// export const API_HOST = "http://localhost:5000"; // local api host (no /api, /uploads etc.)
export const API_HOST = "https://api.clubpromfg.com"; // live api host

export const BASE_URL = `${API_HOST}/api`; // local api url
// export const BASE_URL = "https://api.clubpromfg.com/api"; // live api url
export const MAIN_SITE_URL = "https://clubpromfg.com"; // main website url
// export const MAIN_SITE_URL = "http://localhost:3000"; // main website url

export const BASE_IMAGE_URL = `${API_HOST}/uploads/products/`; // local api url

/**
 * Generic request helper
 */
async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API request failed");
  }

  return response.json();
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options, // ✅ merge options so headers can be sent
    }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),
  delete: (endpoint, options = {}) =>
    request(endpoint, {
      method: "DELETE",
      ...options,
    }),
};


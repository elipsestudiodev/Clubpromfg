// export const API_HOST = 'http://localhost:5000' // local api host (no /api, /uploads etc.)
export const API_HOST = 'https://api.clubpromfg.com' // live api host

// export const BASE_API='https://api.clubpromfg.com/api'
export const BASE_API = `${API_HOST}/api`
export const BASE_URL = 'https://clubpromfg.com'

// export const BASE_URL = 'http://localhost:3000'

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_API}${endpoint}`, {
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

export default api;

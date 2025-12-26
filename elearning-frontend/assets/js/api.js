// assets/js/api.js
export const API_BASE = "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("token");
}
export function getRole() {
  return localStorage.getItem("role");
}

export async function apiFetch(path, { method="GET", body=null, auth=false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  let data = null;
  try { data = await res.json(); } catch (_) {}

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) ? (data.message || data.error) : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
// assets/js/auth.js
import { apiFetch } from "./api.js";

export async function login(email, password) {
  const data = await apiFetch("/auth/login", { method: "POST", body: { email, password } });
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  return data;
}

export async function register({ name, email, password, role }) {
  // PDF backend accepts role or defaults to student :contentReference[oaicite:4]{index=4}
  return await apiFetch("/auth/register", { method: "POST", body: { name, email, password, role } });
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "index.html";
}

export function requireAuth() {
  if (!localStorage.getItem("token")) window.location.href = "login.html";
}

export function requireRole(roles = []) {
  const role = localStorage.getItem("role");
  if (!role || !roles.includes(role)) window.location.href = "index.html";
}
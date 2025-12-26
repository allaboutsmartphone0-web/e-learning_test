// assets/js/ui.js
import { getRole } from "./api.js";
import { logout } from "./auth.js";

export function mountNavbar(active = "") {
  const role = getRole();
  const isAuthed = !!localStorage.getItem("token");

  const nav = document.getElementById("appNavbar");
  if (!nav) return;

  nav.innerHTML = `
  <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top">
    <div class="container">
      <a class="navbar-brand fw-bold" href="index.html">LifeSkills LMS</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="nav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link ${active==="courses"?"active":""}" href="courses.html">Courses</a></li>
          ${isAuthed ? `<li class="nav-item"><a class="nav-link ${active==="dashboard"?"active":""}" href="dashboard.html">Dashboard</a></li>` : ``}
          ${(role === "instructor" || role === "admin") ? `<li class="nav-item"><a class="nav-link ${active==="instructor"?"active":""}" href="instructor.html">Instructor</a></li>` : ``}
          ${(role === "admin") ? `<li class="nav-item"><a class="nav-link ${active==="admin"?"active":""}" href="admin.html">Admin</a></li>` : ``}
        </ul>

        <div class="d-flex gap-2">
          ${!isAuthed ? `
            <a class="btn btn-outline-primary" href="login.html">Login</a>
            <a class="btn btn-primary" href="register.html">Register</a>
          ` : `
            <span class="badge text-bg-light border align-self-center">Role: ${role}</span>
            <button id="btnLogout" class="btn btn-outline-danger">Logout</button>
          `}
        </div>
      </div>
    </div>
  </nav>
  `;

  const btn = document.getElementById("btnLogout");
  if (btn) btn.addEventListener("click", logout);
}

export function toast(msg, type="info") {
  const root = document.getElementById("toastRoot");
  if (!root) return alert(msg);

  const el = document.createElement("div");
  el.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
  el.innerHTML = `
    <div class="fw-semibold">${msg}</div>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  root.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

export function setLoading(id, isLoading, text="Loading...") {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = isLoading ? `<div class="text-muted">${text}</div>` : "";
}
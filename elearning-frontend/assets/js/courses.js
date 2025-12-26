// assets/js/courses.js
import { apiFetch } from "./api.js";
import { toast, setLoading } from "./ui.js";

let allCourses = [];

export async function loadCourses() {
  setLoading("coursesLoading", true);
  try {
    // GET /api/courses returns published courses :contentReference[oaicite:5]{index=5}
    allCourses = await apiFetch("/courses");
    renderCourses(allCourses);
  } catch (err) {
    toast(err.message, "danger");
  } finally {
    setLoading("coursesLoading", false);
  }
}

function matches(course, q, difficulty) {
  const txt = `${course.title} ${course.description || ""} ${course.category_name || ""} ${course.instructor || ""}`.toLowerCase();
  if (q && !txt.includes(q.toLowerCase())) return false;
  if (difficulty && course.difficulty !== difficulty) return false;
  return true;
}

export function bindCourseFilters() {
  const qEl = document.getElementById("q");
  const dEl = document.getElementById("difficulty");

  const apply = () => {
    const q = qEl.value.trim();
    const d = dEl.value;
    const filtered = allCourses.filter(c => matches(c, q, d));
    renderCourses(filtered);
  };

  qEl.addEventListener("input", apply);
  dEl.addEventListener("change", apply);
}

function renderCourses(courses) {
  const grid = document.getElementById("coursesGrid");
  if (!grid) return;

  if (!courses.length) {
    grid.innerHTML = `<div class="text-muted">No courses found.</div>`;
    return;
  }

  grid.innerHTML = `
    <div class="row g-3">
      ${courses.map(c => `
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start gap-2">
                <h5 class="fw-semibold mb-1">${escapeHtml(c.title)}</h5>
                <span class="badge text-bg-light border">${escapeHtml(c.difficulty || "N/A")}</span>
              </div>
              <div class="small-muted mb-2">${escapeHtml(c.category_name || "Uncategorized")} • By ${escapeHtml(c.instructor || "Instructor")}</div>
              <p class="mb-3">${escapeHtml((c.description || "").slice(0, 120))}${(c.description||"").length>120 ? "…" : ""}</p>
              <a class="btn btn-outline-primary w-100" href="course.html?id=${c.course_id}">View Course</a>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
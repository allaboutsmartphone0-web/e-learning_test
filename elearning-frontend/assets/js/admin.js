// assets/js/admin.js
import { apiFetch } from "./api.js";
import { toast, setLoading } from "./ui.js";

export async function loadAdminAnalytics() {
  setLoading("adminLoading", true);

  try {
    const popular = await apiFetch("/admin/analytics/popular-courses", { auth: true });
    const active = await apiFetch("/admin/analytics/active-students", { auth: true });

    renderTable("popularTable", ["Course", "Enrollments"], popular.map(x => [x.title, x.total || x.enrollments || 0]));
    renderTable("activeTable", ["Student", "Courses Enrolled"], active.map(x => [x.name, x.courses_enrolled || 0]));

  } catch (err) {
    toast(err.message, "danger");
  } finally {
    setLoading("adminLoading", false);
  }
}

function renderTable(id, headers, rows) {
  const el = document.getElementById(id);
  if (!el) return;

  el.innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover align-middle">
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`).join("")
            : `<tr><td colspan="${headers.length}" class="text-muted">No data.</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}
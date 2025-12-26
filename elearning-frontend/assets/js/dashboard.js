// assets/js/dashboard.js
import { toast } from "./ui.js";

export function fakeStudentOverview() {
  // Your PDF mentions progress bars, history, certificates, etc. :contentReference[oaicite:10]{index=10}
  // If you add real endpoints later, replace this with API calls.
  const el = document.getElementById("studentOverview");
  if (!el) return;

  el.innerHTML = `
    <div class="row g-3">
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="small-muted">Enrolled courses</div>
            <div class="display-6 fw-bold">—</div>
            <div class="small-muted">Connect to /api/enrollments for real data.</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="small-muted">Completed lessons</div>
            <div class="display-6 fw-bold">—</div>
            <div class="small-muted">Connect to /api/progress for real data.</div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="small-muted">Certificates</div>
            <div class="display-6 fw-bold">—</div>
            <div class="small-muted">Connect to /api/certificates for real data.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  toast("Dashboard loaded (placeholder stats).", "info");
}
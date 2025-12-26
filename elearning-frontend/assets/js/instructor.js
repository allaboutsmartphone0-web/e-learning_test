// assets/js/instructor.js
import { apiFetch } from "./api.js";
import { toast } from "./ui.js";

export function bindCreateCourse() {
  const form = document.getElementById("createCourseForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const body = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        category_id: Number(document.getElementById("category_id").value),
        difficulty: document.getElementById("difficulty").value
      };
      await apiFetch("/courses", { method: "POST", body, auth: true });
      toast("Course created (pending approval).", "success");
      form.reset();
    } catch (err) {
      toast(err.message, "danger");
    }
  });
}
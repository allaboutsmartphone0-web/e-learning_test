const router = require("express").Router();
const pool = require("../db");
const { auth, requireRole } = require("../middleware/auth");

// Mark lesson complete
router.post("/progress/complete", auth, requireRole("student","admin"), async (req, res) => {
  const { enroll_id, lesson_id } = req.body;
  const enrollId = Number(enroll_id);
  const lessonId = Number(lesson_id);

  // ensure enrollment belongs to user (unless admin)
  if (req.user.role !== "admin") {
    const [en] = await pool.query("SELECT enroll_id FROM enrollments WHERE enroll_id=? AND student_id=?", [enrollId, req.user.user_id]);
    if (!en.length) return res.status(403).json({ message: "Not your enrollment" });
  }

  try {
    await pool.query("INSERT INTO progress(enroll_id,lesson_id) VALUES(?,?)", [enrollId, lessonId]);
  } catch (e) {
    // already completed is fine
  }

  res.json({ message: "Completed" });
});

// Get progress summary for an enrollment
router.get("/progress/:enrollId", auth, requireRole("student","admin"), async (req, res) => {
  const enrollId = Number(req.params.enrollId);

  if (req.user.role !== "admin") {
    const [en] = await pool.query("SELECT enroll_id, course_id FROM enrollments WHERE enroll_id=? AND student_id=?", [enrollId, req.user.user_id]);
    if (!en.length) return res.status(403).json({ message: "Not your enrollment" });
  }

  const [[courseRow]] = await pool.query("SELECT course_id FROM enrollments WHERE enroll_id=?", [enrollId]);

  const [total] = await pool.query(`
    SELECT COUNT(*) AS totalLessons
    FROM lessons l
    JOIN modules m ON m.module_id=l.module_id
    WHERE m.course_id=?`, [courseRow.course_id]);

  const [done] = await pool.query("SELECT COUNT(*) AS completedLessons FROM progress WHERE enroll_id=?", [enrollId]);

  res.json({
    totalLessons: total[0].totalLessons,
    completedLessons: done[0].completedLessons
  });
});

module.exports = router;
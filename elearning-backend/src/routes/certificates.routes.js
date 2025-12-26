const router = require("express").Router();
const pool = require("../db");
const { auth, requireRole } = require("../middleware/auth");

// Issue certificate if 100% lessons completed AND quiz passed
router.get("/certificates/:enrollId", auth, requireRole("student","admin"), async (req, res) => {
  const enrollId = Number(req.params.enrollId);

  if (req.user.role !== "admin") {
    const [en] = await pool.query("SELECT enroll_id, course_id FROM enrollments WHERE enroll_id=? AND student_id=?", [enrollId, req.user.user_id]);
    if (!en.length) return res.status(403).json({ message: "Not your enrollment" });
  }

  const [[enRow]] = await pool.query("SELECT course_id FROM enrollments WHERE enroll_id=?", [enrollId]);
  const courseId = enRow.course_id;

  const [total] = await pool.query(`
    SELECT COUNT(*) AS totalLessons
    FROM lessons l JOIN modules m ON m.module_id=l.module_id
    WHERE m.course_id=?`, [courseId]);

  const [done] = await pool.query("SELECT COUNT(*) AS completedLessons FROM progress WHERE enroll_id=?", [enrollId]);

  if (total[0].totalLessons === 0) return res.status(400).json({ message: "Course has no lessons" });
  if (done[0].completedLessons < total[0].totalLessons) {
    return res.status(400).json({ message: "Complete all lessons first" });
  }

  const [[quiz]] = await pool.query("SELECT quiz_id, pass_score FROM quizzes WHERE course_id=?", [courseId]);
  if (!quiz) return res.status(400).json({ message: "Quiz not found" });

  const [best] = await pool.query(
    "SELECT MAX(score) AS bestScore FROM quiz_attempts WHERE enroll_id=? AND quiz_id=?",
    [enrollId, quiz.quiz_id]
  );
  if ((best[0].bestScore || 0) < quiz.pass_score) return res.status(400).json({ message: "Quiz not passed" });

  // create certificate if missing
  await pool.query("INSERT IGNORE INTO certificates(enroll_id) VALUES(?)", [enrollId]);

  const [[cert]] = await pool.query("SELECT certificate_id, issued_at FROM certificates WHERE enroll_id=?", [enrollId]);
  res.json({ certificate: cert, message: "Certificate available" });
});

module.exports = router;
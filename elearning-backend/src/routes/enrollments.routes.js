const router = require("express").Router();
const pool = require("../db");
const { auth, requireRole } = require("../middleware/auth");

// Student: enroll in a published course
router.post("/enroll", auth, requireRole("student","admin"), async (req, res) => {
  const { course_id } = req.body;
  const courseId = Number(course_id);

  const [c] = await pool.query("SELECT course_id FROM courses WHERE course_id=? AND is_published=1", [courseId]);
  if (!c.length) return res.status(404).json({ message: "Course not available" });

  try {
    const [r] = await pool.query("INSERT INTO enrollments(student_id,course_id) VALUES(?,?)", [req.user.user_id, courseId]);
    res.json({ enroll_id: r.insertId });
  } catch (e) {
    if (String(e).includes("uniq_student_course")) return res.status(409).json({ message: "Already enrolled" });
    res.status(500).json({ message: "Server error" });
  }
});

// Student: list my enrollments
router.get("/my/enrollments", auth, requireRole("student","admin"), async (req, res) => {
  const [rows] = await pool.query(`
    SELECT e.enroll_id, c.course_id, c.title, c.difficulty, c.is_published
    FROM enrollments e JOIN courses c ON c.course_id=e.course_id
    WHERE e.student_id=?
    ORDER BY e.enrolled_at DESC
  `, [req.user.user_id]);
  res.json(rows);
});

module.exports = router;
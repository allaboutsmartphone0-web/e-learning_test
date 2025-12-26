const router = require("express").Router();
const pool = require("../db");
const { auth, requireRole } = require("../middleware/auth");

router.use(auth, requireRole("admin"));

// approve instructor
router.post("/approve-instructor", async (req, res) => {
  const { instructor_id } = req.body;
  await pool.query("UPDATE users SET is_approved=1 WHERE user_id=? AND role='instructor'", [instructor_id]);
  res.json({ message: "Instructor approved" });
});

// publish/unpublish course
router.post("/courses/:courseId/publish", async (req, res) => {
  const courseId = Number(req.params.courseId);
  const { is_published } = req.body;
  await pool.query("UPDATE courses SET is_published=? WHERE course_id=?", [is_published ? 1 : 0, courseId]);
  res.json({ message: "Updated" });
});

// analytics: popular courses
router.get("/analytics/popular-courses", async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT c.title, COUNT(e.enroll_id) AS enrollments
    FROM courses c
    LEFT JOIN enrollments e ON e.course_id=c.course_id
    GROUP BY c.course_id
    ORDER BY enrollments DESC
    LIMIT 10
  `);
  res.json(rows);
});

// analytics: active students
router.get("/analytics/active-students", async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT u.name, COUNT(e.enroll_id) AS courses_enrolled
    FROM users u
    LEFT JOIN enrollments e ON e.student_id=u.user_id
    WHERE u.role='student'
    GROUP BY u.user_id
    ORDER BY courses_enrolled DESC
    LIMIT 10
  `);
  res.json(rows);
});

module.exports = router;
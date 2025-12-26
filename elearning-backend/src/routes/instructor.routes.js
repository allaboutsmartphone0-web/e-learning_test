const router = require("express").Router();
const pool = require("../db");
const { auth, requireRole } = require("../middleware/auth");

// Create module
router.post("/courses/:courseId/modules", auth, requireRole("instructor","admin"), async (req, res) => {
  const courseId = Number(req.params.courseId);
  const { title, module_order = 1 } = req.body;

  // Ensure instructor owns course (unless admin)
  if (req.user.role !== "admin") {
    const [own] = await pool.query("SELECT course_id FROM courses WHERE course_id=? AND instructor_id=?", [courseId, req.user.user_id]);
    if (!own.length) return res.status(403).json({ message: "Not your course" });
  }

  const [r] = await pool.query(
    "INSERT INTO modules(course_id,title,module_order) VALUES(?,?,?)",
    [courseId, title, module_order]
  );
  res.json({ module_id: r.insertId });
});

// Create lesson
router.post("/modules/:moduleId/lessons", auth, requireRole("instructor","admin"), async (req, res) => {
  const moduleId = Number(req.params.moduleId);
  const { title, content = "", lesson_order = 1 } = req.body;

  if (req.user.role !== "admin") {
    const [own] = await pool.query(`
      SELECT c.instructor_id
      FROM modules m JOIN courses c ON c.course_id=m.course_id
      WHERE m.module_id=?`, [moduleId]);
    if (!own.length || own[0].instructor_id !== req.user.user_id) return res.status(403).json({ message: "Not your course" });
  }

  const [r] = await pool.query(
    "INSERT INTO lessons(module_id,title,content,lesson_order) VALUES(?,?,?,?)",
    [moduleId, title, content, lesson_order]
  );
  res.json({ lesson_id: r.insertId });
});

// Create quiz (per course)
router.post("/courses/:courseId/quizzes", auth, requireRole("instructor","admin"), async (req, res) => {
  const courseId = Number(req.params.courseId);
  const { title, pass_score = 50 } = req.body;

  if (req.user.role !== "admin") {
    const [own] = await pool.query("SELECT course_id FROM courses WHERE course_id=? AND instructor_id=?", [courseId, req.user.user_id]);
    if (!own.length) return res.status(403).json({ message: "Not your course" });
  }

  const [r] = await pool.query(
    "INSERT INTO quizzes(course_id,title,pass_score) VALUES(?,?,?)",
    [courseId, title, pass_score]
  );
  res.json({ quiz_id: r.insertId });
});

// Add quiz question
router.post("/quizzes/:quizId/questions", auth, requireRole("instructor","admin"), async (req, res) => {
  const quizId = Number(req.params.quizId);
  const { question, option_a, option_b, option_c, option_d, correct_option } = req.body;

  const [r] = await pool.query(
    `INSERT INTO quiz_questions(quiz_id,question,option_a,option_b,option_c,option_d,correct_option)
     VALUES(?,?,?,?,?,?,?)`,
    [quizId, question, option_a, option_b, option_c, option_d, correct_option]
  );
  res.json({ question_id: r.insertId });
});

module.exports = router;
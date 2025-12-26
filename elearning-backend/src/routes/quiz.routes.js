const router = require("express").Router();
const pool = require("../db");
const { auth, requireRole } = require("../middleware/auth");

// Get quiz for a course (published)
router.get("/courses/:courseId/quiz", async (req, res) => {
  const courseId = Number(req.params.courseId);
  const [qz] = await pool.query("SELECT quiz_id,title,pass_score FROM quizzes WHERE course_id=?", [courseId]);
  if (!qz.length) return res.status(404).json({ message: "Quiz not found" });

  const quiz = qz[0];
  const [qs] = await pool.query(`
    SELECT question_id, question, option_a, option_b, option_c, option_d
    FROM quiz_questions WHERE quiz_id=?`, [quiz.quiz_id]);

  res.json({ quiz, questions: qs });
});

// Submit quiz
router.post("/quiz/submit", auth, requireRole("student","admin"), async (req, res) => {
  const { enroll_id, quiz_id, answers } = req.body;
  const enrollId = Number(enroll_id);
  const quizId = Number(quiz_id);

  if (req.user.role !== "admin") {
    const [en] = await pool.query("SELECT enroll_id FROM enrollments WHERE enroll_id=? AND student_id=?", [enrollId, req.user.user_id]);
    if (!en.length) return res.status(403).json({ message: "Not your enrollment" });
  }

  const [qs] = await pool.query("SELECT question_id, correct_option FROM quiz_questions WHERE quiz_id=? ORDER BY question_id", [quizId]);
  if (!qs.length) return res.status(400).json({ message: "Quiz has no questions" });

  // answers must be object: {question_id: "A", ...}
  let correct = 0;
  for (const row of qs) {
    if (String(answers?.[row.question_id] || "").toUpperCase() === row.correct_option) correct++;
  }
  const score = Math.round((correct / qs.length) * 100);

  const [r] = await pool.query("INSERT INTO quiz_attempts(enroll_id,quiz_id,score,submitted_at) VALUES(?,?,?,NOW())",
    [enrollId, quizId, score]);

  res.json({ attempt_id: r.insertId, score });
});

module.exports = router;
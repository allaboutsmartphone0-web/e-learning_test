const router = require("express").Router();
const pool = require("../db");
const { auth, requireRole } = require("../middleware/auth");

// Public: published courses
router.get("/", async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT c.course_id, c.title, c.description, c.difficulty, cat.name AS category_name,
           u.name AS instructor
    FROM courses c
    JOIN categories cat ON cat.category_id=c.category_id
    JOIN users u ON u.user_id=c.instructor_id
    WHERE c.is_published=1
    ORDER BY c.created_at DESC
  `);
  res.json(rows);
});

// Public: course detail
router.get("/:id", async (req, res) => {
  const courseId = Number(req.params.id);
  const [rows] = await pool.query(`
    SELECT c.*, cat.name AS category_name, u.name AS instructor
    FROM courses c
    JOIN categories cat ON cat.category_id=c.category_id
    JOIN users u ON u.user_id=c.instructor_id
    WHERE c.course_id=? AND c.is_published=1
  `, [courseId]);
  if (!rows.length) return res.status(404).json({ message: "Course not found" });
  res.json(rows[0]);
});

// Instructor/Admin: create course (defaults to unpublished)
router.post("/", auth, requireRole("instructor","admin"), async (req, res) => {
  const { title, description, category_id, difficulty } = req.body;
  if (!title || !category_id) return res.status(400).json({ message: "Missing fields" });

  const [r] = await pool.query(
    "INSERT INTO courses(instructor_id,category_id,title,description,difficulty,is_published) VALUES(?,?,?,?,?,0)",
    [req.user.user_id, category_id, title, description || "", difficulty || "Beginner"]
  );
  res.json({ course_id: r.insertId });
});

// Public (published): modules + lessons (for viewing)
router.get("/:id/content", async (req, res) => {
  const courseId = Number(req.params.id);

  const [ok] = await pool.query("SELECT course_id FROM courses WHERE course_id=? AND is_published=1", [courseId]);
  if (!ok.length) return res.status(404).json({ message: "Course not found" });

  const [mods] = await pool.query("SELECT module_id, title, module_order FROM modules WHERE course_id=? ORDER BY module_order", [courseId]);
  const moduleIds = mods.map(m => m.module_id);

  let lessons = [];
  if (moduleIds.length) {
    const [ls] = await pool.query(
      `SELECT lesson_id,module_id,title,content,lesson_order
       FROM lessons WHERE module_id IN (${moduleIds.map(()=>"?").join(",")})
       ORDER BY module_id, lesson_order`,
      moduleIds
    );
    lessons = ls;
  }

  res.json({ modules: mods, lessons });
});

module.exports = router;
const router = require("express").Router();
const pool = require("../db");

router.get("/", async (_req, res) => {
  const [rows] = await pool.query("SELECT category_id, name FROM categories ORDER BY name");
  res.json(rows);
});

module.exports = router;
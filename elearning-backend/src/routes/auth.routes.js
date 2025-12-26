const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, role = "student" } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

  const safeRole = ["student", "instructor"].includes(role) ? role : "student";
  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      "INSERT INTO users(name,email,password_hash,role,is_approved) VALUES(?,?,?,?,?)",
      [name, email, hash, safeRole, safeRole === "student" ? 1 : 0]
    );
    return res.json({ message: "Registered" });
  } catch (e) {
    if (String(e).includes("Duplicate")) return res.status(409).json({ message: "Email already exists" });
    return res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
  if (!rows.length) return res.status(401).json({ message: "Invalid credentials" });

  const u = rows[0];
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  if (u.role === "instructor" && u.is_approved === 0) {
    return res.status(403).json({ message: "Instructor not approved yet" });
  }

  const token = jwt.sign(
    { user_id: u.user_id, role: u.role, name: u.name },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token, role: u.role, name: u.name });
});

module.exports = router;
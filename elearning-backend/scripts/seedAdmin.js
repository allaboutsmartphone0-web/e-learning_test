require("dotenv").config();
const pool = require("../src/db");
const bcrypt = require("bcrypt");

(async () => {
  const email = "admin@lms.com";
  const pass = "admin123";
  const hash = await bcrypt.hash(pass, 10);

  await pool.query(
    `INSERT INTO users(name,email,password_hash,role,is_approved)
     VALUES(?,?,?,?,1)
     ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role='admin', is_approved=1`,
    ["Admin", email, hash, "admin"]
  );

  console.log("Admin ready:", email, pass);
  process.exit(0);
})();
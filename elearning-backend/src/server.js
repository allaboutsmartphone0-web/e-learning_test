require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/categories", require("./routes/categories.routes"));
app.use("/api/courses", require("./routes/courses.routes"));
app.use("/api/instructor", require("./routes/instructor.routes"));
app.use("/api", require("./routes/enrollments.routes"));
app.use("/api", require("./routes/progress.routes"));
app.use("/api", require("./routes/quiz.routes"));
app.use("/api", require("./routes/certificates.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("API running on", PORT));
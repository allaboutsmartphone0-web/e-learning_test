const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors({ origin: "http://localhost:5500" })); // Allow frontend
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// Mock data
let users = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
  { id: 2, name: 'Instructor User', email: 'instructor@example.com', password: bcrypt.hashSync('inst123', 10), role: 'instructor' },
  { id: 3, name: 'Student User', email: 'student@example.com', password: bcrypt.hashSync('stud123', 10), role: 'student' }
];

let courses = [
  { course_id: 1, title: 'Introduction to Cooking', description: 'Learn basic cooking skills.', category_id: 1, category_name: 'Life Skills', difficulty: 'Beginner', instructor: 'Chef John', published: true },
  { course_id: 2, title: 'Advanced Gardening', description: 'Master gardening techniques.', category_id: 1, category_name: 'Life Skills', difficulty: 'Advanced', instructor: 'Gardener Jane', published: true },
  { course_id: 3, title: 'Basic First Aid', description: 'Essential first aid knowledge.', category_id: 2, category_name: 'Health', difficulty: 'Intermediate', instructor: 'Dr. Smith', published: true }
];

let enrollments = [];
let progress = [];
let quizzes = [];

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, name, email, password: hashedPassword, role };
  users.push(newUser);
  res.json({ message: 'User registered successfully' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  res.json({ token, role: user.role });
});

// Courses
app.get('/api/courses', (req, res) => {
  const publishedCourses = courses.filter(c => c.published);
  res.json(publishedCourses);
});

app.post('/api/courses', authenticateToken, (req, res) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only instructors can create courses' });
  }
  const { title, description, category_id, difficulty } = req.body;
  const newCourse = {
    course_id: courses.length + 1,
    title,
    description,
    category_id,
    category_name: 'Uncategorized', // Mock
    difficulty,
    instructor: users.find(u => u.id === req.user.id)?.name || 'Instructor',
    published: false // Pending approval
  };
  courses.push(newCourse);
  res.json({ message: 'Course created successfully' });
});

// Progress
app.post('/api/progress/complete', authenticateToken, (req, res) => {
  const { enroll_id, lesson_id } = req.body;
  // Mock completion
  progress.push({ enroll_id, lesson_id, completed: true });
  res.json({ message: 'Progress updated' });
});

// Quiz
app.post('/api/quiz/submit', authenticateToken, (req, res) => {
  const { enroll_id, quiz_id, answers } = req.body;
  // Mock scoring
  const score = Math.floor(Math.random() * 100); // Random score for demo
  quizzes.push({ enroll_id, quiz_id, answers, score });
  res.json({ score });
});

// Admin analytics
app.get('/api/admin/analytics/popular-courses', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  // Mock popular courses
  const popular = courses.slice(0, 2).map(c => ({ title: c.title, total: Math.floor(Math.random() * 50) + 10 }));
  res.json(popular);
});

app.get('/api/admin/analytics/active-students', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  // Mock active students
  const active = users.filter(u => u.role === 'student').slice(0, 2).map(u => ({ name: u.name, courses_enrolled: Math.floor(Math.random() * 5) + 1 }));
  res.json(active);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
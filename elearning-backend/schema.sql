CREATE DATABASE IF NOT EXISTS elearning_lms;
USE elearning_lms;

-- USERS
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','instructor','admin') NOT NULL DEFAULT 'student',
  is_approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE
);

-- COURSES
CREATE TABLE courses (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  instructor_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty ENUM('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(user_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- MODULES
CREATE TABLE modules (
  module_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  module_order INT NOT NULL DEFAULT 1,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- LESSONS
CREATE TABLE lessons (
  lesson_id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content LONGTEXT,
  lesson_order INT NOT NULL DEFAULT 1,
  FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE CASCADE
);

-- ENROLLMENTS
CREATE TABLE enrollments (
  enroll_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_student_course (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(user_id),
  FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- PROGRESS (lesson completion)
CREATE TABLE progress (
  progress_id INT AUTO_INCREMENT PRIMARY KEY,
  enroll_id INT NOT NULL,
  lesson_id INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_enroll_lesson (enroll_id, lesson_id),
  FOREIGN KEY (enroll_id) REFERENCES enrollments(enroll_id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id) ON DELETE CASCADE
);

-- QUIZZES (one quiz per course or per module; keep course-based for simplicity)
CREATE TABLE quizzes (
  quiz_id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  pass_score INT NOT NULL DEFAULT 50,
  FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

CREATE TABLE quiz_questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option ENUM('A','B','C','D') NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
);

-- QUIZ ATTEMPTS
CREATE TABLE quiz_attempts (
  attempt_id INT AUTO_INCREMENT PRIMARY KEY,
  enroll_id INT NOT NULL,
  quiz_id INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP NULL,
  FOREIGN KEY (enroll_id) REFERENCES enrollments(enroll_id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id) ON DELETE CASCADE
);

-- CERTIFICATES
CREATE TABLE certificates (
  certificate_id INT AUTO_INCREMENT PRIMARY KEY,
  enroll_id INT NOT NULL UNIQUE,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enroll_id) REFERENCES enrollments(enroll_id) ON DELETE CASCADE
);

-- SEED categories
INSERT INTO categories(name) VALUES
('Communication'),('Finance'),('Career'),('Health'),('Productivity')
ON DUPLICATE KEY UPDATE name=name;
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Setup require for CommonJS modules like sqlite3
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'consultant.db');
console.log('Connecting to database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Initialize Tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    created_at TEXT,
    questions TEXT -- Stored as JSON
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    total_score INTEGER,
    submitted_at TEXT,
    answers TEXT, -- Stored as JSON
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
  )`);
});

// --- API Routes ---

// Get all quizzes
app.get('/api/quizzes', (req, res) => {
  db.all('SELECT * FROM quizzes ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    // Safely parse JSON
    try {
      const quizzes = rows.map(row => ({
        ...row,
        questions: row.questions ? JSON.parse(row.questions) : []
      }));
      res.json(quizzes);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      res.status(500).json({ error: 'Failed to parse quiz data' });
    }
  });
});

// Get single quiz
app.get('/api/quizzes/:id', (req, res) => {
  db.get('SELECT * FROM quizzes WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Quiz not found' });
    
    try {
      const quiz = {
        ...row,
        questions: row.questions ? JSON.parse(row.questions) : []
      };
      res.json(quiz);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      res.status(500).json({ error: 'Failed to parse quiz data' });
    }
  });
});

// Create/Update Quiz
app.post('/api/quizzes', (req, res) => {
  const { id, title, description, created_at, questions } = req.body;
  
  try {
    const questionsJson = JSON.stringify(questions || []);

    if (id && id !== 0) {
      // Update
      db.run(
        `UPDATE quizzes SET title = ?, description = ?, questions = ? WHERE id = ?`,
        [title, description, questionsJson, id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Updated', id });
        }
      );
    } else {
      // Create
      db.run(
        `INSERT INTO quizzes (title, description, created_at, questions) VALUES (?, ?, ?, ?)`,
        [title, description, created_at, questionsJson],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Created', id: this.lastID });
        }
      );
    }
  } catch (e) {
    console.error('Save Error:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete Quiz
app.delete('/api/quizzes/:id', (req, res) => {
  db.run('DELETE FROM quizzes WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// Get Submissions
app.get('/api/submissions', (req, res) => {
  db.all('SELECT * FROM submissions ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    try {
      const submissions = rows.map(row => ({
        ...row,
        answers: row.answers ? JSON.parse(row.answers) : []
      }));
      res.json(submissions);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      res.status(500).json({ error: 'Failed to parse submission data' });
    }
  });
});

// Save Submission
app.post('/api/submissions', (req, res) => {
  const { quiz_id, total_score, submitted_at, answers } = req.body;
  const answersJson = JSON.stringify(answers || []);

  db.run(
    `INSERT INTO submissions (quiz_id, total_score, submitted_at, answers) VALUES (?, ?, ?, ?)`,
    [quiz_id, total_score, submitted_at, answersJson],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Submitted', id: this.lastID });
    }
  );
});

// Delete Submission
app.delete('/api/submissions/:id', (req, res) => {
  db.run('DELETE FROM submissions WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// Serve Frontend in Production
// Check if we are running in a production-like environment (or explicit variable)
// Since this script is usually run via 'npm start', we default to serving static files
// unless explicitly in development mode (which uses Vite's proxy).
if (process.env.NODE_ENV !== 'development') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  
  // Handle React Routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
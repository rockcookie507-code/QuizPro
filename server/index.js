import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';

// Setup require for CommonJS modules like sqlite3
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // Allow all CORS requests
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
  next();
});

// Database Setup
const dbPath = path.resolve(__dirname, 'consultant.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('Connecting to database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get all quizzes
app.get('/api/quizzes', (req, res) => {
  db.all('SELECT * FROM quizzes ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    try {
      const quizzes = rows.map(row => ({
        ...row,
        questions: row.questions ? JSON.parse(row.questions) : []
      }));
      res.json(quizzes);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      res.json([]);
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
      res.json([]);
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

// API 404 Handler - MUST be before static files
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.baseUrl}` });
});

// Serve Frontend in Production
// Only serve static files if NOT in development
if (process.env.NODE_ENV !== 'development') {
  const distPath = path.join(__dirname, '../dist');
  
  if (fs.existsSync(distPath)) {
    console.log(`Serving static files from ${distPath}`);
    app.use(express.static(distPath));
    
    // Handle React Routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // If dist doesn't exist, just send a basic message
    app.get('/', (req, res) => {
      res.send('API Server Running. Frontend not found in /dist (Run npm run build).');
    });
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
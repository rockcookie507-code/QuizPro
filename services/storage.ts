import { Quiz, Submission } from '../types';

const QUIZ_KEY = 'consultant_app_quizzes';
const SUBMISSION_KEY = 'consultant_app_submissions';

// Initial Mock Data
const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 1,
    title: "IT Security Maturity Assessment",
    description: "Evaluate the basic security hygiene of the law firm.",
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 101,
        quiz_id: 1,
        text: "Do you enforce Multi-Factor Authentication (MFA) on all email accounts?",
        type: 'single',
        position: 1,
        options: [
          { id: 1001, question_id: 101, text: "Yes, everywhere", score: 10 },
          { id: 1002, question_id: 101, text: "Some accounts", score: 5 },
          { id: 1003, question_id: 101, text: "No", score: 0 }
        ]
      },
      {
        id: 102,
        quiz_id: 1,
        text: "How often are backups performed?",
        type: 'single',
        position: 2,
        options: [
          { id: 1004, question_id: 102, text: "Daily", score: 10 },
          { id: 1005, question_id: 102, text: "Weekly", score: 5 },
          { id: 1006, question_id: 102, text: "Irregularly / Never", score: 0 }
        ]
      }
    ]
  }
];

export const storageService = {
  getQuizzes: (): Quiz[] => {
    const data = localStorage.getItem(QUIZ_KEY);
    if (!data) {
      localStorage.setItem(QUIZ_KEY, JSON.stringify(INITIAL_QUIZZES));
      return INITIAL_QUIZZES;
    }
    return JSON.parse(data);
  },

  getQuiz: (id: number): Quiz | undefined => {
    const quizzes = storageService.getQuizzes();
    return quizzes.find(q => q.id === id);
  },

  saveQuiz: (quiz: Quiz): void => {
    const quizzes = storageService.getQuizzes();
    const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
    
    if (existingIndex >= 0) {
      quizzes[existingIndex] = quiz;
    } else {
      quiz.id = Date.now(); // Simple ID generation
      quizzes.push(quiz);
    }
    localStorage.setItem(QUIZ_KEY, JSON.stringify(quizzes));
  },

  deleteQuiz: (id: number): void => {
     const quizzes = storageService.getQuizzes();
     const filtered = quizzes.filter(q => q.id !== id);
     localStorage.setItem(QUIZ_KEY, JSON.stringify(filtered));
  },

  getSubmissions: (): Submission[] => {
    const data = localStorage.getItem(SUBMISSION_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSubmission: (submission: Submission): void => {
    const submissions = storageService.getSubmissions();
    submission.id = Date.now();
    submissions.push(submission);
    localStorage.setItem(SUBMISSION_KEY, JSON.stringify(submissions));
  },

  deleteSubmission: (id: number): void => {
    const submissions = storageService.getSubmissions();
    const filtered = submissions.filter(s => s.id !== id);
    localStorage.setItem(SUBMISSION_KEY, JSON.stringify(filtered));
  },
  
  // Helper for dashboard
  getStats: () => {
    const submissions = storageService.getSubmissions();
    const totalSubmissions = submissions.length;
    const avgScore = totalSubmissions > 0 
      ? submissions.reduce((acc, s) => acc + s.total_score, 0) / totalSubmissions 
      : 0;
    
    return {
      totalSubmissions,
      avgScore: Math.round(avgScore * 10) / 10
    };
  }
};
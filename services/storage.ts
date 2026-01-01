import { Quiz, Submission } from '../types';

// Helper to handle API responses
const fetchApi = async (endpoint: string, options?: RequestInit) => {
  const res = await fetch(`/api${endpoint}`, options);
  if (!res.ok) throw new Error('API request failed');
  return res.json();
};

export const storageService = {
  getQuizzes: async (): Promise<Quiz[]> => {
    return await fetchApi('/quizzes');
  },

  getQuiz: async (id: number): Promise<Quiz | undefined> => {
    try {
      return await fetchApi(`/quizzes/${id}`);
    } catch (e) {
      return undefined;
    }
  },

  saveQuiz: async (quiz: Quiz): Promise<void> => {
    await fetchApi('/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quiz),
    });
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await fetchApi(`/quizzes/${id}`, { method: 'DELETE' });
  },

  getSubmissions: async (): Promise<Submission[]> => {
    return await fetchApi('/submissions');
  },

  saveSubmission: async (submission: Submission): Promise<void> => {
    await fetchApi('/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
  },

  deleteSubmission: async (id: number): Promise<void> => {
    await fetchApi(`/submissions/${id}`, { method: 'DELETE' });
  }
};
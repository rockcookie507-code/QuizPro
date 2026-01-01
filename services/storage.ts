import { Quiz, Submission } from '../types';

// Helper to handle API responses with better error logging
const fetchApi = async (endpoint: string, options?: RequestInit) => {
  try {
    const res = await fetch(`/api${endpoint}`, options);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error ${res.status} at ${endpoint}: ${errorText}`);
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Network error requesting ${endpoint}:`, error);
    throw error;
  }
};

export const storageService = {
  getQuizzes: async (): Promise<Quiz[]> => {
    return await fetchApi('/quizzes');
  },

  getQuiz: async (id: number): Promise<Quiz | undefined> => {
    try {
      return await fetchApi(`/quizzes/${id}`);
    } catch (e) {
      console.warn('Quiz not found or error fetching:', e);
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
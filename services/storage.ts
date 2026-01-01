import { Quiz, Submission } from '../types';

// Determine the base URL. 
// In development or preview, we might want to target port 3001 directly if the proxy fails.
// However, standard practice is relative paths. 
// If you continue to see 404s, you can change this to 'http://localhost:3001'
const API_BASE = ''; 

// Helper to handle API responses with better error logging
const fetchApi = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE}/api${endpoint}`;
  try {
    const res = await fetch(url, options);
    
    // Check if the response is JSON (API) or HTML (404 from static server)
    const contentType = res.headers.get("content-type");
    
    if (!res.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorJson = await res.json();
        console.error(`API Error ${res.status}:`, errorJson);
        throw new Error(errorJson.error || `API request failed: ${res.status}`);
      } else {
        const errorText = await res.text();
        // If we get "File not found" it means we hit the static server, not the API
        console.error(`API Connectivity Error. Is the backend running on port 3001? Response: ${errorText}`);
        throw new Error(`Cannot connect to API (${res.status}). Ensure backend is running.`);
      }
    }
    return await res.json();
  } catch (error) {
    console.error(`Network error requesting ${url}:`, error);
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
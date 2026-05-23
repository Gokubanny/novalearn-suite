import api from '../lib/api';

export interface PdfSession {
  _id: string;
  title: string;
  pdfs: Array<{
    name: string;
    size: number;
    uploadedAt: string;
  }>;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  learningStyle: {
    difficultyPreference: 'easy' | 'medium' | 'hard';
    explanationDetail: 'concise' | 'detailed' | 'comprehensive';
    preferredSubjects: string[];
    studyReminders: boolean;
  };
  aiSettings: {
    responseTemperature: number;
    maxTokens: number;
    contextLength: number;
  };
}

export const aiService = {
  // ── PDF Chat Sessions (NEW) ────────────────────────────────────────────────
  createPdfSession: (pdfs: File[], title?: string) => {
    const formData = new FormData();
    pdfs.forEach(pdf => formData.append('pdfs', pdf));
    if (title) formData.append('title', title);
    return api.post('/api/ai/pdf-sessions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getPdfSessions: () =>
    api.get('/api/ai/pdf-sessions'),

  getPdfSession: (sessionId: string) =>
    api.get(`/api/ai/pdf-sessions/${sessionId}`),

  chatWithPdfSession: (sessionId: string, question: string) =>
    api.post(`/api/ai/pdf-sessions/${sessionId}/chat`, { question }),

  deletePdfSession: (sessionId: string) =>
    api.delete(`/api/ai/pdf-sessions/${sessionId}`),

  // ── User Preferences (NEW) ─────────────────────────────────────────────────
  getUserPreferences: () =>
    api.get('/api/ai/preferences'),

  updateUserPreferences: (preferences: Partial<UserPreferences>) =>
    api.put('/api/ai/preferences', preferences),

  // ── Legacy AI features ─────────────────────────────────────────────────────
  chatWithPDF: (pdf: File, question: string, conversationHistory?: any[]) => {
    const formData = new FormData();
    formData.append('pdf', pdf);
    formData.append('question', question);
    if (conversationHistory) {
      formData.append('conversationHistory', JSON.stringify(conversationHistory));
    }
    return api.post('/api/ai/chat-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  chat: (question: string, subject?: string, conversationHistory?: any[]) =>
    api.post('/api/ai/chat', { question, subject, conversationHistory }),

  summarisePDF: (pdf: File) => {
    const formData = new FormData();
    formData.append('pdf', pdf);
    return api.post('/api/ai/summarise', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  generateQuestions: (topic: string, difficulty: string, count: number) =>
    api.post('/api/ai/generate-questions', { topic, difficulty, count }),

  getPerformanceInsights: () =>
    api.get('/api/ai/performance-insights'),

  // ── Persistent history ──────────────────────────────────────────────────────
  getChatHistory: () =>
    api.get('/api/ai/history'),

  saveChatHistory: (messages: { role: string; content: string; timestamp: string }[]) =>
    api.post('/api/ai/history', { messages }),

  clearChatHistory: () =>
    api.delete('/api/ai/history'),
};
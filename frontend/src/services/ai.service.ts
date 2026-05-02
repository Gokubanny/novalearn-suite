import api from '../lib/api';

export const aiService = {
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
  getPerformanceInsights: () => api.get('/api/ai/performance-insights'),
};

import { Router } from 'express';
import {
  chatWithPDF, chatGeneral, summarisePDF,
  generateQuestions, getPerformanceInsights,
  getChatHistory, saveChatHistory, clearChatHistory,
} from './ai.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { uploadPDF } from '../../middleware/upload.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect, authorize(UserRole.STUDENT, UserRole.LECTURER));

// ── AI features ───────────────────────────────────────────────────────────────
router.post('/chat-pdf', uploadPDF.single('pdf'), chatWithPDF);
router.post('/chat', chatGeneral);
router.post('/summarise', uploadPDF.single('pdf'), summarisePDF);
router.post('/generate-questions', generateQuestions);
router.get('/performance-insights', authorize(UserRole.STUDENT), getPerformanceInsights);

// ── Persistent chat history ───────────────────────────────────────────────────
router.get('/history', getChatHistory);
router.post('/history', saveChatHistory);
router.delete('/history', clearChatHistory);

export default router;
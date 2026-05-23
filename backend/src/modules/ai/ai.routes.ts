import { Router } from 'express';
import {
  chatWithPDF, chatGeneral, summarisePDF,
  generateQuestions, getPerformanceInsights,
  getChatHistory, saveChatHistory, clearChatHistory,
  createPdfSession, getPdfSessions, getPdfSession,
  chatWithPdfSession, deletePdfSession,
  updateUserPreferences, getUserPreferences,
} from './ai.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { uploadPDF, uploadMultiplePDFs } from '../../middleware/upload.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect, authorize(UserRole.STUDENT, UserRole.LECTURER));

// ── PDF Chat Sessions (NEW) ───────────────────────────────────────────────────
router.post('/pdf-sessions', uploadMultiplePDFs.array('pdfs', 3), createPdfSession);
router.get('/pdf-sessions', getPdfSessions);
router.get('/pdf-sessions/:sessionId', getPdfSession);
router.post('/pdf-sessions/:sessionId/chat', chatWithPdfSession);
router.delete('/pdf-sessions/:sessionId', deletePdfSession);

// ── User Preferences (NEW) ────────────────────────────────────────────────────
router.get('/preferences', getUserPreferences);
router.put('/preferences', updateUserPreferences);

// ── Legacy AI features ────────────────────────────────────────────────────────
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
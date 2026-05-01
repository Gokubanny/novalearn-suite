import { Router } from 'express';
import {
  chatWithPDF, chatGeneral, summarisePDF,
  generateQuestions, getPerformanceInsights,
} from './ai.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { uploadPDF } from '../../middleware/upload.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect, authorize(UserRole.STUDENT, UserRole.LECTURER));

router.post('/chat-pdf', uploadPDF.single('pdf'), chatWithPDF);
router.post('/chat', chatGeneral);
router.post('/summarise', uploadPDF.single('pdf'), summarisePDF);
router.post('/generate-questions', generateQuestions);
router.get('/performance-insights', authorize(UserRole.STUDENT), getPerformanceInsights);

export default router;

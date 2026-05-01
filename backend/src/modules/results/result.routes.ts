import { Router } from 'express';
import {
  uploadResults, publishResults, getCourseResults,
  getStudentResults, getTranscript,
} from './result.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect);

// Lecturer
router.post('/courses/:courseId', authorize(UserRole.LECTURER), uploadResults);
router.patch('/courses/:courseId/publish', authorize(UserRole.LECTURER), publishResults);
router.get('/courses/:courseId', authorize(UserRole.LECTURER, UserRole.SCHOOL_ADMIN), getCourseResults);

// Student
router.get('/my-results', authorize(UserRole.STUDENT), getStudentResults);
router.get('/my-transcript', authorize(UserRole.STUDENT), getTranscript);

export default router;

import { Router } from 'express';
import {
  createAssignment, getLecturerAssignments, getStudentAssignments,
  submitAssignment, gradeSubmission, getAssignmentSubmissions,
} from './assignment.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { uploadAny } from '../../middleware/upload.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect);

// ── Lecturer ──────────────────────────────────────────────────────────────────
router.post('/', authorize(UserRole.LECTURER), uploadAny.array('attachments', 5), createAssignment);
router.get('/my-assignments', authorize(UserRole.LECTURER), getLecturerAssignments);
router.get('/:assignmentId/submissions', authorize(UserRole.LECTURER), getAssignmentSubmissions);
router.patch('/:assignmentId/grade/:studentId', authorize(UserRole.LECTURER), gradeSubmission);

// ── Student ───────────────────────────────────────────────────────────────────
router.get('/student-assignments', authorize(UserRole.STUDENT), getStudentAssignments);
router.post('/:assignmentId/submit', authorize(UserRole.STUDENT), uploadAny.single('file'), submitAssignment);

export default router;
import { Router } from 'express';
import {
  markAttendanceFacial, markAttendanceManual,
  getCourseAttendance, getStudentAttendanceSummary,
  registerStudentFace,
} from './attendance.controller';
import {
  startSession, endSession, getActiveSession,
  submitSelfie, getSessionResults,
} from './session.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { uploadFaceImage } from '../../middleware/upload.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect);

// ── FACE REGISTRATION ─────────────────────────────────────────────────────────
router.post(
  '/register-face',
  authorize(UserRole.STUDENT),
  uploadFaceImage.single('image'),
  registerStudentFace
);

// ── SESSION ROUTES (Geofenced attendance) ─────────────────────────────────────
// Lecturer: start/end a session
router.post('/sessions/courses/:courseId/start', authorize(UserRole.LECTURER), startSession);
router.patch('/sessions/:sessionId/end', authorize(UserRole.LECTURER), endSession);
router.get('/sessions/courses/:courseId/active', protect, getActiveSession);
router.get('/sessions/:sessionId/results', authorize(UserRole.LECTURER), getSessionResults);

// Student: submit selfie during open session
router.post(
  '/sessions/:sessionId/selfie',
  authorize(UserRole.STUDENT),
  uploadFaceImage.single('image'),
  submitSelfie
);

// ── LEGACY ROUTES (Lecturer class photo) ─────────────────────────────────────
router.post(
  '/courses/:courseId/facial',
  authorize(UserRole.LECTURER),
  uploadFaceImage.single('image'),
  markAttendanceFacial
);
router.post('/courses/:courseId/manual', authorize(UserRole.LECTURER), markAttendanceManual);
router.get(
  '/courses/:courseId',
  authorize(UserRole.LECTURER, UserRole.SCHOOL_ADMIN),
  getCourseAttendance
);

// ── STUDENT SUMMARY ───────────────────────────────────────────────────────────
router.get(
  '/courses/:courseId/my-summary',
  authorize(UserRole.STUDENT),
  getStudentAttendanceSummary
);

export default router;

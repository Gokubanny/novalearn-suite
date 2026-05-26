import { Router } from 'express';
import {
  createCourse, getLecturerCourses, getStudentCourses,
  getAllCourses, enrolInCourse, dropCourse,
  getCourseStudents, updateCourse, deleteCourse,
  updateCourseSchedule,
} from './course.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect);

// ── School Admin ──────────────────────────────────────────────────────────────
router.delete('/:id', authorize(UserRole.SCHOOL_ADMIN, UserRole.LECTURER), deleteCourse);
router.get('/all', authorize(UserRole.SCHOOL_ADMIN, UserRole.STUDENT), getAllCourses);

// ── Lecturer ──────────────────────────────────────────────────────────────────
router.post('/', authorize(UserRole.LECTURER), createCourse);
router.get('/my-courses', authorize(UserRole.LECTURER), getLecturerCourses);
router.get('/:courseId/students', authorize(UserRole.LECTURER, UserRole.SCHOOL_ADMIN), getCourseStudents);
router.patch('/:id', authorize(UserRole.LECTURER), updateCourse);

// ── Schedule (Admin + Lecturer) ───────────────────────────────────────────────
router.patch(
  '/:courseId/schedule',
  authorize(UserRole.SCHOOL_ADMIN, UserRole.LECTURER),
  updateCourseSchedule
);

// ── Student ───────────────────────────────────────────────────────────────────
router.get('/enrolled', authorize(UserRole.STUDENT), getStudentCourses);
router.post('/:courseId/enrol', authorize(UserRole.STUDENT), enrolInCourse);
router.delete('/:courseId/drop', authorize(UserRole.STUDENT), dropCourse);

export default router;
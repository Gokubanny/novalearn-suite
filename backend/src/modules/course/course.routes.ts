import { Router } from 'express';
import {
  createCourse, getLecturerCourses, getStudentCourses,
  getAllCourses, enrolInCourse, dropCourse,
  getCourseStudents, updateCourse, deleteCourse,
} from './course.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect);

// ── School Admin ──────────────────────────────────────────────────────────────
router.delete('/:id', authorize(UserRole.SCHOOL_ADMIN, UserRole.LECTURER), deleteCourse);

// ── Browse all courses — School Admin AND Students (for self-enrollment) ──────
// Students need this to see available courses in their school before enrolling.
// The controller already filters by req.user.school so data isolation is maintained.
router.get('/all', authorize(UserRole.SCHOOL_ADMIN, UserRole.STUDENT), getAllCourses);

// ── Lecturer ──────────────────────────────────────────────────────────────────
router.post('/', authorize(UserRole.LECTURER), createCourse);
router.get('/my-courses', authorize(UserRole.LECTURER), getLecturerCourses);
router.get('/:courseId/students', authorize(UserRole.LECTURER, UserRole.SCHOOL_ADMIN), getCourseStudents);
router.patch('/:id', authorize(UserRole.LECTURER), updateCourse);

// ── Student ───────────────────────────────────────────────────────────────────
router.get('/enrolled', authorize(UserRole.STUDENT), getStudentCourses);
router.post('/:courseId/enrol', authorize(UserRole.STUDENT), enrolInCourse);
router.delete('/:courseId/drop', authorize(UserRole.STUDENT), dropCourse);

export default router;
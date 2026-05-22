import { Router } from 'express';
import {
  getSchoolStats, getSchoolProfile, updateSchoolProfile, uploadSchoolLogo,
  createDepartment, getDepartments, updateDepartment, deleteDepartment,
  getPendingStudents, getAllStudents, approveStudent, rejectStudent, suspendStudent,
  getPendingLecturers, getAllLecturers, approveLecturer, rejectLecturer,
} from './school.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { uploadImage } from '../../middleware/upload.middleware';
import { UserRole } from '../../types';

const router = Router();

// ── PUBLIC TO ALL AUTHENTICATED USERS ────────────────────────────────────────
// Lecturers and students need to read departments (e.g. when creating a course
// or registering). This must be defined BEFORE the router.use() admin guard.
router.get(
  '/departments',
  protect,
  authorize(UserRole.SCHOOL_ADMIN, UserRole.LECTURER, UserRole.STUDENT),
  getDepartments
);

// ── SCHOOL ADMIN ONLY — applied to all routes below ──────────────────────────
router.use(protect, authorize(UserRole.SCHOOL_ADMIN));

// Dashboard
router.get('/stats', getSchoolStats);

// School profile
router.get('/profile', getSchoolProfile);
router.patch('/profile', updateSchoolProfile);
router.post('/logo', uploadImage.single('logo'), uploadSchoolLogo);

// Departments (write operations — admin only)
router.post('/departments', createDepartment);
router.patch('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Students
router.get('/students/pending', getPendingStudents);
router.get('/students', getAllStudents);
router.patch('/students/:id/approve', approveStudent);
router.patch('/students/:id/reject', rejectStudent);
router.patch('/students/:id/suspend', suspendStudent);

// Lecturers
router.get('/lecturers/pending', getPendingLecturers);
router.get('/lecturers', getAllLecturers);
router.patch('/lecturers/:id/approve', approveLecturer);
router.patch('/lecturers/:id/reject', rejectLecturer);

export default router;
import { Router } from 'express';
import {
  login,
  registerStudent,
  registerLecturer,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getMe,
  getSchoolStats,
  getSchoolProfile,
  updateSchoolProfile,
  uploadSchoolLogo,
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  getPendingStudents,
  getAllStudents,
  approveStudent,
  rejectStudent,
  suspendStudent,
  getPendingLecturers,
  getAllLecturers,
  approveLecturer,
  rejectLecturer,
  getStudentProfile,
  getLecturerProfile,
  searchSchoolsPublic,
  getPublicDepartments,
} from './auth.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { uploadImage } from '../../middleware/upload.middleware';
import { UserRole } from '../../types';

const router = Router();

// ── PUBLIC AUTH ROUTES (No authentication required) ────────────────────────
router.post('/login', login);
router.post('/register/student', registerStudent);
router.post('/register/lecturer', registerLecturer);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// ── PUBLIC SEARCH ROUTES (used during registration) ────────────────────────
router.get('/public/search', searchSchoolsPublic);
router.get('/public/:schoolId/departments', getPublicDepartments);

// ── PROTECTED ROUTES (Authentication required) ─────────────────────────────
router.get('/me', protect, getMe);
router.patch('/change-password', protect, changePassword);
router.patch('/update-profile', protect, updateProfile);

// ── DEPARTMENT ROUTES (Accessible by all authenticated users) ─────────────
router.get(
  '/departments',
  protect,
  authorize(UserRole.SCHOOL_ADMIN, UserRole.LECTURER, UserRole.STUDENT),
  getDepartments
);

// ── SCHOOL ADMIN ONLY ROUTES ────────────────────────────────────────────────
router.use(protect, authorize(UserRole.SCHOOL_ADMIN));

// Dashboard
router.get('/stats', getSchoolStats);

// School profile
router.get('/profile', getSchoolProfile);
router.patch('/profile', updateSchoolProfile);
router.post('/logo', uploadImage.single('logo'), uploadSchoolLogo);

// Departments (write operations)
router.post('/departments', createDepartment);
router.patch('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Students
router.get('/students/pending', getPendingStudents);
router.get('/students', getAllStudents);
router.get('/students/:studentId/profile', getStudentProfile);
router.patch('/students/:id/approve', approveStudent);
router.patch('/students/:id/reject', rejectStudent);
router.patch('/students/:id/suspend', suspendStudent);

// Lecturers
router.get('/lecturers/pending', getPendingLecturers);
router.get('/lecturers', getAllLecturers);
router.get('/lecturers/:lecturerId/profile', getLecturerProfile);
router.patch('/lecturers/:id/approve', approveLecturer);
router.patch('/lecturers/:id/reject', rejectLecturer);

export default router;
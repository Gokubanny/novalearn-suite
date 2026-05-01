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
router.use(protect, authorize(UserRole.SCHOOL_ADMIN));

// Dashboard
router.get('/stats', getSchoolStats);

// School profile
router.get('/profile', getSchoolProfile);
router.patch('/profile', updateSchoolProfile);
router.post('/logo', uploadImage.single('logo'), uploadSchoolLogo);

// Departments
router.post('/departments', createDepartment);
router.get('/departments', getDepartments);
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

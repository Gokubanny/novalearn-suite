import { Router } from 'express';
import {
  registerStudent,
  registerLecturer,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
} from './auth.controller';
import { protect } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register/student', registerStudent);
router.post('/register/lecturer', registerLecturer);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.patch('/change-password', changePassword);
router.patch('/update-profile', updateProfile);

export default router;

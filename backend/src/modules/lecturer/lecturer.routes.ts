import { Router } from 'express';
import { getStudentPerformance } from './lecturer.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect, authorize(UserRole.LECTURER));

router.get('/student-performance', getStudentPerformance);

export default router;
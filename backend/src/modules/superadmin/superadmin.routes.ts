import { Router } from 'express';
import {
  getPlatformStats,
  getAllSchools,
  createSchool,
  getSchool,
  toggleSchoolStatus,
  updateSubscription,
  getAllUsers,
} from './superadmin.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../types';

const router = Router();

router.use(protect, authorize(UserRole.SUPER_ADMIN));

router.get('/stats', getPlatformStats);
router.get('/schools', getAllSchools);
router.post('/schools', createSchool);
router.get('/schools/:id', getSchool);
router.patch('/schools/:id/toggle-status', toggleSchoolStatus);
router.patch('/schools/:id/subscription', updateSubscription);
router.get('/users', getAllUsers);

export default router;

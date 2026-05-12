import { Router } from 'express';
import { uploadMaterial, listMaterials, deleteMaterial } from './material.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { uploadAny } from '../../middleware/upload.middleware';
import { UserRole } from '../../types';

const router = Router();
router.use(protect);

router.get('/courses/:courseId', listMaterials);
router.post(
  '/courses/:courseId',
  authorize(UserRole.LECTURER, UserRole.SCHOOL_ADMIN),
  uploadAny.single('file'),
  uploadMaterial
);
router.delete('/:id', authorize(UserRole.LECTURER, UserRole.SCHOOL_ADMIN), deleteMaterial);

export default router;

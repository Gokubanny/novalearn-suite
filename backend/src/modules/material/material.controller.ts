import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import Material from './material.model';
import Course from '../course/course.model';
import { AuthRequest, UserRole } from '../../types';
import { AppError } from '../../middleware/error.middleware';

const buildFileUrl = (req: AuthRequest, filename: string) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol;
  return `${proto}://${req.get('host')}/uploads/${filename}`;
};

export const uploadMaterial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    if (!req.file) throw new AppError('File is required.', 400);
    if (!title) throw new AppError('Title is required.', 400);

    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found.', 404);
    if (
      req.user!.role !== UserRole.SCHOOL_ADMIN &&
      String(course.lecturer) !== String(req.user!.id)
    ) {
      // Lecturer must own course
      const Lecturer = (await import('../lecturer/lecturer.model')).default;
      const lec = await Lecturer.findOne({ user: req.user!.id });
      if (!lec || String(course.lecturer) !== String(lec._id)) {
        throw new AppError('Not authorized to upload to this course.', 403);
      }
    }

    const filename = path.basename(req.file.path);
    const material = await Material.create({
      course: courseId,
      uploadedBy: req.user!.id,
      title,
      description,
      fileUrl: buildFileUrl(req, filename),
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res.status(201).json({ success: true, data: material });
  } catch (e) { next(e); }
};

export const listMaterials = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const items = await Material.find({ course: courseId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'firstName lastName');
    res.json({ success: true, data: items });
  } catch (e) { next(e); }
};

export const deleteMaterial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const m = await Material.findById(req.params.id);
    if (!m) throw new AppError('Material not found.', 404);
    if (
      req.user!.role !== UserRole.SCHOOL_ADMIN &&
      String(m.uploadedBy) !== String(req.user!.id)
    ) {
      throw new AppError('Not authorized.', 403);
    }
    try {
      const url = new URL(m.fileUrl);
      const filePath = path.join(process.cwd(), url.pathname);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch { /* ignore */ }
    await m.deleteOne();
    res.json({ success: true });
  } catch (e) { next(e); }
};

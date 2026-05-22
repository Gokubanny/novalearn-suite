import { Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import Material from './material.model';
import Course from '../course/course.model';
import { AuthRequest, UserRole } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadMaterial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    if (!req.file) throw new AppError('File is required.', 400);
    if (!title) throw new AppError('Title is required.', 400);

    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found.', 404);
    
    if (req.user!.role !== UserRole.SCHOOL_ADMIN && String(course.lecturer) !== String(req.user!.id)) {
      const Lecturer = (await import('../lecturer/lecturer.model')).default;
      const lec = await Lecturer.findOne({ user: req.user!.id });
      if (!lec || String(course.lecturer) !== String(lec._id)) {
        throw new AppError('Not authorized to upload to this course.', 403);
      }
    }

    // Determine resource type based on file mimetype
    const isPDF = req.file.mimetype === 'application/pdf';
    const isImage = req.file.mimetype.startsWith('image/');
    const isVideo = req.file.mimetype.startsWith('video/');
    
    let resourceType: 'auto' | 'raw' | 'image' | 'video' = 'auto';
    let uploadOptions: any = {
      folder: `courses/${courseId}/materials`,
      use_filename: true,
      unique_filename: true,
    };

    if (isPDF) {
      resourceType = 'raw';
      // For PDFs, use raw upload type
      uploadOptions.resource_type = 'raw';
      uploadOptions.flags = 'attachment';
    } else if (isImage) {
      resourceType = 'image';
      uploadOptions.resource_type = 'image';
    } else if (isVideo) {
      resourceType = 'video';
      uploadOptions.resource_type = 'video';
    } else {
      uploadOptions.resource_type = 'auto';
    }

    const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);

    // Delete local file after upload
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log('Could not delete local file:', err);
    }

    // Build the correct URL for PDFs
    let fileUrl = result.secure_url;
    if (isPDF) {
      // For raw PDFs, ensure proper URL format
      fileUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${result.public_id}.pdf`;
    }

    const material = await Material.create({
      course: courseId,
      uploadedBy: req.user!.id,
      title,
      description,
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryPublicId: result.public_id,
      resourceType: resourceType,
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
    
    if (req.user!.role !== UserRole.SCHOOL_ADMIN && String(m.uploadedBy) !== String(req.user!.id)) {
      throw new AppError('Not authorized.', 403);
    }
    
    // Delete from Cloudinary if we have the public ID
    if (m.cloudinaryPublicId) {
      try {
        const resourceType = (m as any).resourceType || 'raw';
        await cloudinary.uploader.destroy(m.cloudinaryPublicId, { resource_type: resourceType });
      } catch (err) {
        console.log('Could not delete from Cloudinary:', err);
      }
    }
    
    await m.deleteOne();
    res.json({ success: true });
  } catch (e) { next(e); }
};
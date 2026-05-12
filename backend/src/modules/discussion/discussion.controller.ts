import { Response, NextFunction } from 'express';
import Discussion from './discussion.model';
import Course from '../course/course.model';
import Lecturer from '../lecturer/lecturer.model';
import { AuthRequest, UserRole } from '../../types';
import { AppError } from '../../middleware/error.middleware';

async function canModerate(req: AuthRequest, courseId: string) {
  if (req.user!.role === UserRole.SCHOOL_ADMIN) return true;
  if (req.user!.role !== UserRole.LECTURER) return false;
  const course = await Course.findById(courseId);
  if (!course) return false;
  const lec = await Lecturer.findOne({ user: req.user!.id });
  return !!lec && String(course.lecturer) === String(lec._id);
}

export const listDiscussions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await Discussion.find({ course: req.params.courseId })
      .sort({ pinned: -1, updatedAt: -1 })
      .populate('author', 'firstName lastName role')
      .populate('replies.author', 'firstName lastName role');
    res.json({ success: true, data: items });
  } catch (e) { next(e); }
};

export const createDiscussion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) throw new AppError('Title and body are required.', 400);
    const d = await Discussion.create({
      course: req.params.courseId,
      author: req.user!.id,
      title, body,
    });
    const populated = await d.populate('author', 'firstName lastName role');
    res.status(201).json({ success: true, data: populated });
  } catch (e) { next(e); }
};

export const replyDiscussion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { body } = req.body;
    if (!body) throw new AppError('Body is required.', 400);
    const d = await Discussion.findById(req.params.id);
    if (!d) throw new AppError('Discussion not found.', 404);
    d.replies.push({ author: req.user!.id as any, body, createdAt: new Date() } as any);
    await d.save();
    const populated = await d.populate('replies.author', 'firstName lastName role');
    res.json({ success: true, data: populated });
  } catch (e) { next(e); }
};

export const togglePin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const d = await Discussion.findById(req.params.id);
    if (!d) throw new AppError('Discussion not found.', 404);
    if (!(await canModerate(req, String(d.course)))) {
      throw new AppError('Not authorized to pin.', 403);
    }
    d.pinned = !d.pinned;
    await d.save();
    res.json({ success: true, data: d });
  } catch (e) { next(e); }
};

export const deleteDiscussion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const d = await Discussion.findById(req.params.id);
    if (!d) throw new AppError('Discussion not found.', 404);
    const isAuthor = String(d.author) === String(req.user!.id);
    if (!isAuthor && !(await canModerate(req, String(d.course)))) {
      throw new AppError('Not authorized.', 403);
    }
    await d.deleteOne();
    res.json({ success: true });
  } catch (e) { next(e); }
};

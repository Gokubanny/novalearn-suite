import { Response } from 'express';
import Course from './course.model';
import Lecturer from '../lecturer/lecturer.model';
import Student from '../student/student.model';
import { AuthRequest, UserRole } from '../../types';
import { AppError } from '../../middleware/error.middleware';

// ── CREATE COURSE ────────────────────────────────────────────────────────────
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    title, code, departmentId, creditUnits,
    semester, session, level, classType, zoomLink, schedule,
  } = req.body;

  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const existing = await Course.findOne({
    school: req.user?.school, code: code.toUpperCase(), session,
  });
  if (existing) throw new AppError('A course with this code already exists for this session.', 409);

  const course = await Course.create({
    title, code: code.toUpperCase(),
    school: req.user?.school,
    department: departmentId,
    lecturer: lecturer._id,
    creditUnits, semester, session, level,
    classType, zoomLink, schedule,
  });

  // Add course to lecturer's courses
  await Lecturer.findByIdAndUpdate(lecturer._id, {
    $addToSet: { courses: course._id },
  });

  res.status(201).json({ success: true, message: 'Course created.', data: course });
};

// ── GET LECTURER COURSES ─────────────────────────────────────────────────────
export const getLecturerCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const courses = await Course.find({ lecturer: lecturer._id, isActive: true })
    .populate('department', 'name code')
    .populate('enrolledStudents', 'matricNumber')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: 'Courses fetched.', data: courses });
};

// ── GET STUDENT COURSES ──────────────────────────────────────────────────────
export const getStudentCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school });
  if (!student) throw new AppError('Student profile not found.', 404);

  const courses = await Course.find({
    _id: { $in: student.enrolledCourses },
    isActive: true,
  })
    .populate('lecturer', 'staffId title')
    .populate('department', 'name code');

  res.status(200).json({ success: true, message: 'Enrolled courses fetched.', data: courses });
};

// ── GET ALL SCHOOL COURSES ───────────────────────────────────────────────────
export const getAllCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const department = req.query.department as string;
  const level = req.query.level as string;
  const semester = req.query.semester as string;

  const filter: Record<string, unknown> = { school: req.user?.school, isActive: true };
  if (department) filter.department = department;
  if (level) filter.level = Number(level);
  if (semester) filter.semester = semester;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate('lecturer', 'staffId title')
      .populate('department', 'name code')
      .skip(skip).limit(limit).sort({ createdAt: -1 }),
    Course.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Courses fetched.',
    data: courses,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

// ── ENROL IN COURSE ──────────────────────────────────────────────────────────
export const enrolInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;

  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school });
  if (!student) throw new AppError('Student profile not found.', 404);

  const course = await Course.findOne({
    _id: courseId, school: req.user?.school, isActive: true,
  });
  if (!course) throw new AppError('Course not found.', 404);

  if (student.enrolledCourses.some(c => c.toString() === courseId)) {
    throw new AppError('Already enrolled in this course.', 409);
  }

  await Promise.all([
    Student.findByIdAndUpdate(student._id, {
      $addToSet: { enrolledCourses: courseId },
    }),
    Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: student._id },
    }),
  ]);

  res.status(200).json({ success: true, message: 'Successfully enrolled in course.' });
};

// ── DROP COURSE ──────────────────────────────────────────────────────────────
export const dropCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;

  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school });
  if (!student) throw new AppError('Student profile not found.', 404);

  await Promise.all([
    Student.findByIdAndUpdate(student._id, {
      $pull: { enrolledCourses: courseId },
    }),
    Course.findByIdAndUpdate(courseId, {
      $pull: { enrolledStudents: student._id },
    }),
  ]);

  res.status(200).json({ success: true, message: 'Course dropped.' });
};

// ── GET COURSE STUDENTS ──────────────────────────────────────────────────────
export const getCourseStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const course = await Course.findOne({
    _id: req.params.courseId,
    school: req.user?.school,
  }).populate({
    path: 'enrolledStudents',
    populate: { path: 'user', select: 'firstName lastName email' },
  });

  if (!course) throw new AppError('Course not found.', 404);

  res.status(200).json({
    success: true,
    message: 'Course students fetched.',
    data: course.enrolledStudents,
  });
};

// ── UPDATE COURSE ────────────────────────────────────────────────────────────
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  const lecturer = await Lecturer.findOne({ user: req.user?.id });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, lecturer: lecturer._id, school: req.user?.school },
    req.body,
    { new: true, runValidators: true }
  );

  if (!course) throw new AppError('Course not found or unauthorized.', 404);

  res.status(200).json({ success: true, message: 'Course updated.', data: course });
};

// ── DELETE COURSE ────────────────────────────────────────────────────────────
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  const isAdmin = req.user?.role === UserRole.SCHOOL_ADMIN;
  const filter: Record<string, unknown> = { _id: req.params.id, school: req.user?.school };

  if (!isAdmin) {
    const lecturer = await Lecturer.findOne({ user: req.user?.id });
    if (!lecturer) throw new AppError('Lecturer profile not found.', 404);
    filter.lecturer = lecturer._id;
  }

  const course = await Course.findOneAndUpdate(filter, { isActive: false }, { new: true });
  if (!course) throw new AppError('Course not found or unauthorized.', 404);

  res.status(200).json({ success: true, message: 'Course deactivated.' });
};

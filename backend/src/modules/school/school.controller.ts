import { Response } from 'express';
import School from './school.model';
import Department from '../department/department.model';
import Student from '../student/student.model';
import Lecturer from '../lecturer/lecturer.model';
import Course from '../course/course.model';
import Attendance from '../attendance/attendance.model';
import User from '../auth/user.model';
import Notification from '../notification/notification.model';
import { AuthRequest, ApprovalStatus, AttendanceStatus, NotificationType } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { sendEmail, emailTemplates } from '../../utils/email';
import { uploadImage } from '../../config/cloudinary';
import fs from 'fs';

// ── GET SCHOOL DASHBOARD STATS ──────────────────────────────────────────────
export const getSchoolStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const schoolId = req.user?.school;

  const [
    totalStudents, pendingStudents, totalLecturers,
    pendingLecturers, totalCourses, totalDepartments,
  ] = await Promise.all([
    Student.countDocuments({ school: schoolId, approvalStatus: ApprovalStatus.APPROVED }),
    Student.countDocuments({ school: schoolId, approvalStatus: ApprovalStatus.PENDING }),
    Lecturer.countDocuments({ school: schoolId, approvalStatus: ApprovalStatus.APPROVED }),
    Lecturer.countDocuments({ school: schoolId, approvalStatus: ApprovalStatus.PENDING }),
    Course.countDocuments({ school: schoolId, isActive: true }),
    Department.countDocuments({ school: schoolId, isActive: true }),
  ]);

  const school = await School.findById(schoolId).select('subscription name');

  res.status(200).json({
    success: true,
    message: 'School stats fetched.',
    data: {
      totalStudents, pendingStudents, totalLecturers,
      pendingLecturers, totalCourses, totalDepartments,
      subscription: school?.subscription,
    },
  });
};

// ── GET ATTENDANCE ANALYTICS (institution-wide, by department) ─────────────
export const getAttendanceAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  const schoolId = req.user?.school;

  const records = await Attendance.find({ school: schoolId })
    .populate({ path: 'course', select: 'department', populate: { path: 'department', select: 'name' } });

  let total = 0;
  let present = 0;
  const byDept: Record<string, { id: string; name: string; total: number; present: number }> = {};

  records.forEach((record: any) => {
    const deptId = record.course?.department?._id?.toString() ?? 'unknown';
    const deptName = record.course?.department?.name ?? 'Unknown';
    if (!byDept[deptId]) byDept[deptId] = { id: deptId, name: deptName, total: 0, present: 0 };

    record.records.forEach((r: any) => {
      total += 1;
      byDept[deptId].total += 1;
      if (r.status === AttendanceStatus.PRESENT) {
        present += 1;
        byDept[deptId].present += 1;
      }
    });
  });

  res.status(200).json({
    success: true,
    message: 'Attendance analytics fetched.',
    data: { total, present, byDepartment: Object.values(byDept) },
  });
};

// ── GET ATTENDANCE ANALYTICS FOR ONE DEPARTMENT (by course) ─────────────────
export const getDepartmentAttendanceAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  const schoolId = req.user?.school;
  const departmentId = req.params.id;

  const department = await Department.findOne({ _id: departmentId, school: schoolId }).select('name code');
  if (!department) throw new AppError('Department not found.', 404);

  const courses = await Course.find({ department: departmentId, school: schoolId }).select('title code');
  const courseIds = courses.map((c) => c._id);

  const records = await Attendance.find({ school: schoolId, course: { $in: courseIds } })
    .select('course records');

  const byCourse: Record<string, { name: string; code: string; total: number; present: number }> = {};
  courses.forEach((c) => {
    byCourse[c._id.toString()] = { name: c.title, code: c.code, total: 0, present: 0 };
  });

  let total = 0;
  let present = 0;

  records.forEach((record: any) => {
    const courseId = record.course.toString();
    if (!byCourse[courseId]) return;

    record.records.forEach((r: any) => {
      total += 1;
      byCourse[courseId].total += 1;
      if (r.status === AttendanceStatus.PRESENT) {
        present += 1;
        byCourse[courseId].present += 1;
      }
    });
  });

  const courseStats = Object.values(byCourse).map((c) => ({
    ...c,
    rate: c.total ? Math.round((c.present / c.total) * 100) : 0,
  }));

  res.status(200).json({
    success: true,
    message: 'Department attendance analytics fetched.',
    data: {
      department: { id: department._id, name: department.name, code: department.code },
      total,
      present,
      rate: total ? Math.round((present / total) * 100) : 0,
      byCourse: courseStats,
    },
  });
};

// ── GET SCHOOL PROFILE ──────────────────────────────────────────────────────
export const getSchoolProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const school = await School.findById(req.user?.school)
    .populate('admin', 'firstName lastName email phone');
  if (!school) throw new AppError('School not found.', 404);

  res.status(200).json({ success: true, message: 'School profile fetched.', data: school });
};

// ── UPDATE SCHOOL PROFILE ───────────────────────────────────────────────────
export const updateSchoolProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, address, state, phone, email, website } = req.body;

  const school = await School.findByIdAndUpdate(
    req.user?.school,
    { name, address, state, phone, email, website },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: 'School profile updated.', data: school });
};

// ── UPLOAD SCHOOL LOGO ──────────────────────────────────────────────────────
export const uploadSchoolLogo = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) throw new AppError('No file uploaded.', 400);

  const imageUrl = await uploadImage(req.file.path, 'nexford/logos');
  fs.unlinkSync(req.file.path);

  const school = await School.findByIdAndUpdate(
    req.user?.school,
    { logo: imageUrl },
    { new: true }
  );

  res.status(200).json({ success: true, message: 'Logo uploaded.', data: { logo: school?.logo } });
};

// ── DEPARTMENT CRUD ─────────────────────────────────────────────────────────
export const createDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, code, description } = req.body;

  const existing = await Department.findOne({ school: req.user?.school, code: code.toUpperCase() });
  if (existing) throw new AppError('Department with this code already exists.', 409);

  const department = await Department.create({
    name, code, description, school: req.user?.school,
  });

  res.status(201).json({ success: true, message: 'Department created.', data: department });
};

export const getDepartments = async (req: AuthRequest, res: Response): Promise<void> => {
  const departments = await Department.find({ school: req.user?.school, isActive: true })
    .populate('head', 'firstName lastName');

  res.status(200).json({ success: true, message: 'Departments fetched.', data: departments });
};

export const updateDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    name, code, description, head,
    matricPrefix, matricSeparator, matricYearFormat, matricSequenceDigits,
  } = req.body;

  const department = await Department.findOneAndUpdate(
    { _id: req.params.id, school: req.user?.school },
    { name, code, description, head, matricPrefix, matricSeparator, matricYearFormat, matricSequenceDigits },
    { new: true, runValidators: true }
  );
  if (!department) throw new AppError('Department not found.', 404);

  res.status(200).json({ success: true, message: 'Department updated.', data: department });
};

export const deleteDepartment = async (req: AuthRequest, res: Response): Promise<void> => {
  const department = await Department.findOneAndUpdate(
    { _id: req.params.id, school: req.user?.school },
    { isActive: false },
    { new: true }
  );
  if (!department) throw new AppError('Department not found.', 404);

  res.status(200).json({ success: true, message: 'Department deactivated.' });
};

// ── STUDENT MANAGEMENT ──────────────────────────────────────────────────────
export const getPendingStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const students = await Student.find({
    school: req.user?.school,
    approvalStatus: ApprovalStatus.PENDING,
  })
    .populate('user', 'firstName lastName email phone createdAt')
    .populate('department', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: 'Pending students fetched.', data: students });
};

export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;
  const department = req.query.department as string;
  const level = req.query.level as string;

  const filter: Record<string, unknown> = { school: req.user?.school };
  if (status) filter.approvalStatus = status;
  if (department) filter.department = department;
  if (level) filter.level = Number(level);

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('user', 'firstName lastName email phone profileImage')
      .populate('department', 'name code')
      .skip(skip).limit(limit).sort({ createdAt: -1 }),
    Student.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Students fetched.',
    data: students,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

export const approveStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await Student.findOne({ _id: req.params.id, school: req.user?.school })
    .populate<{ user: any }>('user', 'firstName lastName email');

  if (!student) throw new AppError('Student not found.', 404);

  student.approvalStatus = ApprovalStatus.APPROVED;
  await student.save();

  await User.findByIdAndUpdate(student.user._id, { isActive: true });

  try {
    const school = await School.findById(req.user?.school).select('name');
    await sendEmail({
      to: student.user.email,
      subject: 'NexFord Edu - Account Approved',
      html: emailTemplates.welcomeStudent(
        student.user.firstName,
        student.matricNumber,
        school?.name || 'Your Institution'
      ),
    });
  } catch {
    // Email failure should not block approval
  }

  await Notification.create({
    recipient: student.user._id,
    school: req.user?.school,
    title: 'Account Approved',
    message: 'Your student account has been approved. You can now log in.',
    type: NotificationType.SUCCESS,
  });

  res.status(200).json({ success: true, message: 'Student approved successfully.', data: student });
};

export const rejectStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const { reason } = req.body;
  const student = await Student.findOne({ _id: req.params.id, school: req.user?.school })
    .populate<{ user: any }>('user', 'firstName lastName email');

  if (!student) throw new AppError('Student not found.', 404);

  student.approvalStatus = ApprovalStatus.REJECTED;
  await student.save();

  await Notification.create({
    recipient: student.user._id,
    school: req.user?.school,
    title: 'Account Rejected',
    message: reason || 'Your registration was rejected. Please contact your institution.',
    type: NotificationType.ALERT,
  });

  res.status(200).json({ success: true, message: 'Student rejected.' });
};

export const suspendStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, school: req.user?.school },
    { approvalStatus: ApprovalStatus.SUSPENDED },
    { new: true }
  );
  if (!student) throw new AppError('Student not found.', 404);

  res.status(200).json({ success: true, message: 'Student suspended.' });
};

// ── LECTURER MANAGEMENT ─────────────────────────────────────────────────────
export const getPendingLecturers = async (req: AuthRequest, res: Response): Promise<void> => {
  const lecturers = await Lecturer.find({
    school: req.user?.school,
    approvalStatus: ApprovalStatus.PENDING,
  })
    .populate('user', 'firstName lastName email phone createdAt')
    .populate('department', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: 'Pending lecturers fetched.', data: lecturers });
};

export const getAllLecturers = async (req: AuthRequest, res: Response): Promise<void> => {
  const lecturers = await Lecturer.find({ school: req.user?.school })
    .populate('user', 'firstName lastName email phone profileImage')
    .populate('department', 'name code')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: 'Lecturers fetched.', data: lecturers });
};

export const approveLecturer = async (req: AuthRequest, res: Response): Promise<void> => {
  const lecturer = await Lecturer.findOne({ _id: req.params.id, school: req.user?.school })
    .populate<{ user: any }>('user', 'firstName lastName email');

  if (!lecturer) throw new AppError('Lecturer not found.', 404);

  lecturer.approvalStatus = ApprovalStatus.APPROVED;
  await lecturer.save();

  await User.findByIdAndUpdate(lecturer.user._id, { isActive: true });

  await Notification.create({
    recipient: lecturer.user._id,
    school: req.user?.school,
    title: 'Account Approved',
    message: 'Your lecturer account has been approved. You can now log in.',
    type: NotificationType.SUCCESS,
  });

  try {
    await sendEmail({
      to: lecturer.user.email,
      subject: 'NexFord Edu - Account Approved',
      html: emailTemplates.accountApproved(
        `${lecturer.user.firstName} ${lecturer.user.lastName}`,
        'Lecturer'
      ),
    });
  } catch {
    // Email failure should not block approval
  }

  res.status(200).json({ success: true, message: 'Lecturer approved.', data: lecturer });
};

export const rejectLecturer = async (req: AuthRequest, res: Response): Promise<void> => {
  const lecturer = await Lecturer.findOneAndUpdate(
    { _id: req.params.id, school: req.user?.school },
    { approvalStatus: ApprovalStatus.REJECTED },
    { new: true }
  );
  if (!lecturer) throw new AppError('Lecturer not found.', 404);

  res.status(200).json({ success: true, message: 'Lecturer rejected.' });
};

// ── GET SINGLE STUDENT PROFILE (School Admin) ─────────────────────────────────
export const getStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { studentId } = req.params;

  const student = await Student.findOne({ _id: studentId, school: req.user?.school })
    .populate('user', 'firstName lastName email phone profileImage createdAt')
    .populate('department', 'name code')
    .populate('enrolledCourses', 'title code creditUnits semester');

  if (!student) throw new AppError('Student not found.', 404);

  res.status(200).json({ success: true, message: 'Student profile fetched.', data: student });
};

// ── GET SINGLE LECTURER PROFILE (School Admin) ────────────────────────────────
export const getLecturerProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { lecturerId } = req.params;

  const lecturer = await Lecturer.findOne({ _id: lecturerId, school: req.user?.school })
    .populate('user', 'firstName lastName email phone profileImage createdAt')
    .populate('department', 'name code')
    .populate({
      path: 'courses',
      select: 'title code creditUnits semester enrolledStudents',
    });

  if (!lecturer) throw new AppError('Lecturer not found.', 404);

  res.status(200).json({ success: true, message: 'Lecturer profile fetched.', data: lecturer });
};
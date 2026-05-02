import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from './user.model';
import School from '../school/school.model';
import Student from '../student/student.model';
import Lecturer from '../lecturer/lecturer.model';
import Notification from '../notification/notification.model';
import { AuthRequest, UserRole, ApprovalStatus, NotificationType } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { sendEmail, emailTemplates } from '../../utils/email';
import { generateToken, hashToken, getCurrentSession } from '../../utils/helpers';

const signToken = (id: string, role: UserRole, school?: string, email?: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign(
    { id, role, school, email },
    secret,
    { expiresIn } as jwt.SignOptions
  );
};

const sendTokenResponse = (res: Response, user: any, statusCode: number, message: string) => {
  const token = signToken(user._id.toString(), user.role, user.school, user.email);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
    },
  });
};

// ── REGISTER STUDENT ────────────────────────────────────────────────────────
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  const {
    firstName, lastName, email, password, phone,
    schoolCode, departmentId, level, matricNumber,
  } = req.body;

  const school = await School.findOne({ code: schoolCode.toUpperCase(), isActive: true });
  if (!school) throw new AppError('School not found or inactive.', 404);

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('An account with this email already exists.', 409);

  const user = await User.create({
    firstName, lastName, email, password,
    phone, role: UserRole.STUDENT,
  });

  const session = getCurrentSession();

  const student = await Student.create({
    user: user._id,
    school: school._id,
    department: departmentId,
    matricNumber: matricNumber || `${school.code}/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000) + 1000}`,
    level: level || 100,
    currentSession: session,
    approvalStatus: ApprovalStatus.PENDING,
  });

  // Notify school admin
  await Notification.create({
    recipient: school.admin,
    school: school._id,
    title: 'New Student Registration',
    message: `${firstName} ${lastName} has registered and is awaiting approval.`,
    type: NotificationType.INFO,
    link: `/school/students/${student._id}`,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Your account is pending approval from your institution.',
    data: { email, matricNumber: student.matricNumber },
  });
};

// ── REGISTER LECTURER ───────────────────────────────────────────────────────
export const registerLecturer = async (req: Request, res: Response): Promise<void> => {
  const {
    firstName, lastName, email, password, phone,
    schoolCode, departmentId, title, qualification, specialisation,
  } = req.body;

  const school = await School.findOne({ code: schoolCode.toUpperCase(), isActive: true });
  if (!school) throw new AppError('School not found or inactive.', 404);

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('An account with this email already exists.', 409);

  const user = await User.create({
    firstName, lastName, email, password,
    phone, role: UserRole.LECTURER,
  });

  const lecturerCount = await Lecturer.countDocuments({ school: school._id });
  const staffId = `${school.code}/STAFF/${String(lecturerCount + 1).padStart(4, '0')}`;

  const lecturer = await Lecturer.create({
    user: user._id,
    school: school._id,
    department: departmentId,
    staffId,
    title,
    qualification,
    specialisation,
    approvalStatus: ApprovalStatus.PENDING,
  });

  await Notification.create({
    recipient: school.admin,
    school: school._id,
    title: 'New Lecturer Registration',
    message: `${title} ${firstName} ${lastName} has registered and is awaiting approval.`,
    type: NotificationType.INFO,
    link: `/school/lecturers/${lecturer._id}`,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Your account is pending approval.',
    data: { email, staffId },
  });
};

// ── LOGIN ───────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) throw new AppError('Please provide email and password.', 400);

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password.', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password.', 401);

  if (!user.isActive) throw new AppError('Your account has been deactivated. Contact support.', 403);

  // Check approval for students and lecturers
  if (user.role === UserRole.STUDENT) {
    const student = await Student.findOne({ user: user._id });
    if (student?.approvalStatus === ApprovalStatus.PENDING) {
      throw new AppError('Your account is still pending approval from your institution.', 403);
    }
    if (student?.approvalStatus === ApprovalStatus.REJECTED) {
      throw new AppError('Your account registration was rejected. Contact your institution.', 403);
    }
    if (student?.approvalStatus === ApprovalStatus.SUSPENDED) {
      throw new AppError('Your account has been suspended. Contact your institution.', 403);
    }
  }

  if (user.role === UserRole.LECTURER) {
    const lecturer = await Lecturer.findOne({ user: user._id });
    if (lecturer?.approvalStatus === ApprovalStatus.PENDING) {
      throw new AppError('Your account is still pending approval from your institution.', 403);
    }
    if (lecturer?.approvalStatus === ApprovalStatus.REJECTED) {
      throw new AppError('Your account registration was rejected. Contact your institution.', 403);
    }
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Get school for non super-admin users
  let schoolId: string | undefined;
  if (user.role === UserRole.STUDENT) {
    const student = await Student.findOne({ user: user._id });
    schoolId = student?.school?.toString();
  } else if (user.role === UserRole.LECTURER) {
    const lecturer = await Lecturer.findOne({ user: user._id });
    schoolId = lecturer?.school?.toString();
  } else if (user.role === UserRole.SCHOOL_ADMIN) {
    const school = await School.findOne({ admin: user._id });
    schoolId = school?._id?.toString();
  }

  const token = signToken(user._id.toString(), user.role, schoolId, user.email);

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    token,
    data: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      school: schoolId,
      profileImage: user.profileImage,
    },
  });
};

// ── GET CURRENT USER ─────────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.id);
  if (!user) throw new AppError('User not found.', 404);

  let profileData: any = {};

  if (user.role === UserRole.STUDENT) {
    profileData = await Student.findOne({ user: user._id })
      .populate('school', 'name code logo')
      .populate('department', 'name code')
      .populate('enrolledCourses', 'title code creditUnits');
  } else if (user.role === UserRole.LECTURER) {
    profileData = await Lecturer.findOne({ user: user._id })
      .populate('school', 'name code logo')
      .populate('department', 'name code')
      .populate('courses', 'title code');
  } else if (user.role === UserRole.SCHOOL_ADMIN) {
    profileData = await School.findOne({ admin: user._id });
  }

  res.status(200).json({
    success: true,
    message: 'Profile fetched successfully.',
    data: { user, profile: profileData },
  });
};

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal whether email exists
    res.status(200).json({
      success: true,
      message: 'If this email is registered, you will receive a reset link.',
    });
    return;
  }

  const resetToken = generateToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'NexFord Edu - Password Reset Request',
      html: emailTemplates.passwordReset(user.firstName, resetUrl),
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Error sending email. Please try again.', 500);
  }

  res.status(200).json({
    success: true,
    message: 'If this email is registered, you will receive a reset link.',
  });
};

// ── RESET PASSWORD ─────────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Invalid or expired reset token.', 400);

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(res, user, 200, 'Password reset successful.');
};

// ── CHANGE PASSWORD ────────────────────────────────────────────────────────────
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?.id).select('+password');
  if (!user) throw new AppError('User not found.', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new AppError('Current password is incorrect.', 401);

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully.' });
};

// ── UPDATE PROFILE ─────────────────────────────────────────────────────────────
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { firstName, lastName, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    { firstName, lastName, phone },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: 'Profile updated.', data: user });
};

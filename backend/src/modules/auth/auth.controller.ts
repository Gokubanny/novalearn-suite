import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import School from '../school/school.model';
import Department from '../department/department.model';
import Student from '../student/student.model';
import Lecturer from '../lecturer/lecturer.model';
import Course from '../course/course.model';
import User from '../auth/user.model';
import Notification from '../notification/notification.model';
import { AuthRequest, ApprovalStatus, NotificationType } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { sendEmail, emailTemplates } from '../../utils/email';
import { uploadImage } from '../../config/cloudinary';
import { getCurrentSession } from '../../utils/helpers';
import fs from 'fs';

// ── AUTHENTICATION FUNCTIONS ──────────────────────────────────────────────────

// ── LOGIN ──────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
      return;
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
      return;
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Check if user has been approved (for students and lecturers)
    let approvalStatus = 'approved';
    let profileData = null;

    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        approvalStatus = student.approvalStatus;
        if (approvalStatus !== 'approved') {
          res.status(401).json({
            success: false,
            message: `Your account is ${approvalStatus}. Please wait for approval.`
          });
          return;
        }
        profileData = student.toObject();
      }
    } else if (user.role === 'lecturer') {
      const lecturer = await Lecturer.findOne({ user: user._id });
      if (lecturer) {
        approvalStatus = lecturer.approvalStatus;
        if (approvalStatus !== 'approved') {
          res.status(401).json({
            success: false,
            message: `Your account is ${approvalStatus}. Please wait for approval.`
          });
          return;
        }
        profileData = lecturer.toObject();
      }
    } else if (user.role === 'school_admin') {
      const school = await School.findOne({ admin: user._id });
      if (school) {
        // Deliberately minimal — just the school id, not school.toObject().
        // Spreading the full School document into userData below would leak
        // subscription/logo/etc. into the user's own profile response.
        profileData = { school: school._id };
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        email: user.email,
        school: profileData?.school || null
      },
      secret,
      { expiresIn: '7d' }
    );

    // Prepare user data for response
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      ...(profileData || {}),
      approvalStatus
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// ── REGISTER STUDENT ──────────────────────────────────────────────────────────
export const registerStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      schoolCode,
      departmentId,
      level,
      matricNumber,
    } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !schoolCode || !departmentId) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Find school
    const school = await School.findOne({ code: schoolCode.toUpperCase(), isActive: true });
    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found with this code'
      });
      return;
    }

    // Check department
    const department = await Department.findOne({ _id: departmentId, school: school._id });
    if (!department) {
      res.status(404).json({
        success: false,
        message: 'Department not found'
      });
      return;
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'student'
    });

    // Create student profile
    const student = await Student.create({
      user: user._id,
      school: school._id,
      department: departmentId,
      level: level || 100,
      matricNumber: matricNumber || `STU${Date.now().toString().slice(-6)}`,
      approvalStatus: ApprovalStatus.PENDING,
      currentSession: getCurrentSession(),
    });

    // Notify school admin
    try {
      await Notification.create({
        recipient: school.admin,
        school: school._id,
        title: 'New Student Registration',
        message: `${firstName} ${lastName} has registered as a student and needs approval.`,
        type: NotificationType.INFO,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Student registered successfully. Please wait for approval.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        student: {
          id: student._id,
          matricNumber: student.matricNumber,
          approvalStatus: student.approvalStatus,
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// ── REGISTER LECTURER ──────────────────────────────────────────────────────────
export const registerLecturer = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      schoolCode,
      departmentId,
      title,
      qualification,
      specialisation,
    } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !schoolCode || !departmentId) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Find school
    const school = await School.findOne({ code: schoolCode.toUpperCase(), isActive: true });
    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found with this code'
      });
      return;
    }

    // Check department
    const department = await Department.findOne({ _id: departmentId, school: school._id });
    if (!department) {
      res.status(404).json({
        success: false,
        message: 'Department not found'
      });
      return;
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'lecturer'
    });

    // Create lecturer profile
    const lecturer = await Lecturer.create({
      user: user._id,
      school: school._id,
      department: departmentId,
      title: title || 'Lecturer',
      qualification: qualification || '',
      specialisation: specialisation || '',
      approvalStatus: ApprovalStatus.PENDING
    });

    // Notify school admin
    try {
      await Notification.create({
        recipient: school.admin,
        school: school._id,
        title: 'New Lecturer Registration',
        message: `${firstName} ${lastName} has registered as a lecturer and needs approval.`,
        type: NotificationType.INFO,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Lecturer registered successfully. Please wait for approval.',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        lecturer: {
          id: lecturer._id,
          approvalStatus: lecturer.approvalStatus,
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// ── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: emailTemplates.passwordReset(
          user.firstName,
          resetUrl
        ),
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      // Reset token fields if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      res.status(500).json({
        success: false,
        message: 'Could not send reset email. Please try again.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing request'
    });
  }
};

// ── RESET PASSWORD ──────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
      return;
    }

    // Hash token
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
      return;
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resetting password'
    });
  }
};

// ── CHANGE PASSWORD ──────────────────────────────────────────────────────────
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
      return;
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
};

// ── UPDATE PROFILE ──────────────────────────────────────────────────────────
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// ── GET ME ──────────────────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    let profileData = {};
    
    // Get profile data based on role
    if (user.role === 'student') {
      const student = await Student.findOne({ user: userId })
        .populate('department', 'name code');
      if (student) {
        profileData = student.toObject();
      }
    } else if (user.role === 'lecturer') {
      const lecturer = await Lecturer.findOne({ user: userId })
        .populate('department', 'name code');
      if (lecturer) {
        profileData = lecturer.toObject();
      }
    }

    res.status(200).json({
      success: true,
      message: 'User profile fetched',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
        },
        profile: profileData
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// ── PUBLIC: SEARCH SCHOOLS (used during registration, no auth) ───────────────
export const searchSchoolsPublic = async (req: Request, res: Response): Promise<void> => {
  const q = ((req.query.q as string) || '').trim();

  if (q.length < 2) {
    res.status(200).json({ success: true, message: 'Type at least 2 characters.', data: [] });
    return;
  }

  const schools = await School.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { code: { $regex: q, $options: 'i' } },
    ],
  })
    .select('name code logo')
    .limit(10);

  res.status(200).json({
    success: true,
    message: 'Schools fetched.',
    data: schools.map(s => ({
      id:   s._id,
      name: s.name,
      code: s.code,
      logo: s.logo,
    })),
  });
};

// ── PUBLIC: GET DEPARTMENTS FOR A SCHOOL (used during registration, no auth) ─
export const getPublicDepartments = async (req: Request, res: Response): Promise<void> => {
  const { schoolId } = req.params;

  const school = await School.findOne({ _id: schoolId, isActive: true }).select('_id');
  if (!school) throw new AppError('School not found.', 404);

  const departments = await Department.find({ school: schoolId, isActive: true })
    .select('name code')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Departments fetched.',
    data: departments.map(d => ({ id: d._id, name: d.name, code: d.code })),
  });
};

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
  const department = await Department.findOneAndUpdate(
    { _id: req.params.id, school: req.user?.school },
    req.body,
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

// ── GET SINGLE STUDENT PROFILE ────────────────────────────────────────────────
export const getStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { studentId } = req.params;

  const student = await Student.findOne({ _id: studentId, school: req.user?.school })
    .populate('user', 'firstName lastName email phone profileImage createdAt')
    .populate('department', 'name code')
    .populate('enrolledCourses', 'title code creditUnits semester');

  if (!student) throw new AppError('Student not found.', 404);

  res.status(200).json({ success: true, message: 'Student profile fetched.', data: student });
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

// ── GET SINGLE LECTURER PROFILE ───────────────────────────────────────────────
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
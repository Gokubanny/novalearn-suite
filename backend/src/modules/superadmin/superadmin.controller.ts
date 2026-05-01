import { Response } from 'express';
import User from '../auth/user.model';
import School from '../school/school.model';
import Student from '../student/student.model';
import Lecturer from '../lecturer/lecturer.model';
import { AuthRequest, UserRole, SubscriptionPlan, SubscriptionStatus } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { sendEmail, emailTemplates } from '../../utils/email';

// ── GET PLATFORM STATS ──────────────────────────────────────────────────────
export const getPlatformStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  const [totalSchools, activeSchools, totalStudents, totalLecturers, totalUsers] =
    await Promise.all([
      School.countDocuments(),
      School.countDocuments({ isActive: true }),
      Student.countDocuments(),
      Lecturer.countDocuments(),
      User.countDocuments(),
    ]);

  const subscriptionBreakdown = await School.aggregate([
    { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
  ]);

  const recentSchools = await School.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('admin', 'firstName lastName email');

  res.status(200).json({
    success: true,
    message: 'Platform statistics fetched.',
    data: {
      totalSchools,
      activeSchools,
      totalStudents,
      totalLecturers,
      totalUsers,
      subscriptionBreakdown,
      recentSchools,
    },
  });
};

// ── GET ALL SCHOOLS ──────────────────────────────────────────────────────────
export const getAllSchools = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const status = req.query.status as string;

  const filter: Record<string, unknown> = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const [schools, total] = await Promise.all([
    School.find(filter)
      .populate('admin', 'firstName lastName email phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    School.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Schools fetched.',
    data: schools,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

// ── CREATE SCHOOL ────────────────────────────────────────────────────────────
export const createSchool = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    name, code, address, state, country, phone,
    email, website, adminFirstName, adminLastName,
    adminEmail, adminPassword, plan,
  } = req.body;

  // Check code is unique
  const existing = await School.findOne({ code: code.toUpperCase() });
  if (existing) throw new AppError('A school with this code already exists.', 409);

  // Create admin user
  const adminUser = await User.create({
    firstName: adminFirstName,
    lastName: adminLastName,
    email: adminEmail,
    password: adminPassword,
    role: UserRole.SCHOOL_ADMIN,
    isEmailVerified: true,
  });

  // Set subscription limits based on plan
  const planLimits: Record<string, { maxStudents: number; maxLecturers: number }> = {
    basic: { maxStudents: 500, maxLecturers: 50 },
    pro: { maxStudents: 2000, maxLecturers: 200 },
    enterprise: { maxStudents: 10000, maxLecturers: 1000 },
  };
  const limits = planLimits[plan || 'basic'];

  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

  const school = await School.create({
    name, code, address, state,
    country: country || 'Nigeria',
    phone, email, website,
    admin: adminUser._id,
    subscription: {
      plan: plan || SubscriptionPlan.BASIC,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate,
      ...limits,
    },
  });

  try {
    await sendEmail({
      to: adminEmail,
      subject: 'NexFord Edu - School Account Created',
      html: emailTemplates.accountApproved(`${adminFirstName} ${adminLastName}`, 'School Administrator'),
    });
  } catch {
    // Email failure should not block creation
  }

  res.status(201).json({
    success: true,
    message: 'School created successfully.',
    data: school,
  });
};

// ── GET SINGLE SCHOOL ────────────────────────────────────────────────────────
export const getSchool = async (req: AuthRequest, res: Response): Promise<void> => {
  const school = await School.findById(req.params.id)
    .populate('admin', 'firstName lastName email phone');

  if (!school) throw new AppError('School not found.', 404);

  const [studentCount, lecturerCount] = await Promise.all([
    Student.countDocuments({ school: school._id }),
    Lecturer.countDocuments({ school: school._id }),
  ]);

  res.status(200).json({
    success: true,
    message: 'School fetched.',
    data: { ...school.toObject(), studentCount, lecturerCount },
  });
};

// ── TOGGLE SCHOOL STATUS ─────────────────────────────────────────────────────
export const toggleSchoolStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const school = await School.findById(req.params.id);
  if (!school) throw new AppError('School not found.', 404);

  school.isActive = !school.isActive;
  await school.save();

  res.status(200).json({
    success: true,
    message: `School ${school.isActive ? 'activated' : 'suspended'} successfully.`,
    data: school,
  });
};

// ── UPDATE SUBSCRIPTION ───────────────────────────────────────────────────────
export const updateSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  const { plan, durationMonths } = req.body;
  const school = await School.findById(req.params.id);
  if (!school) throw new AppError('School not found.', 404);

  const planLimits: Record<string, { maxStudents: number; maxLecturers: number }> = {
    basic: { maxStudents: 500, maxLecturers: 50 },
    pro: { maxStudents: 2000, maxLecturers: 200 },
    enterprise: { maxStudents: 10000, maxLecturers: 1000 },
  };

  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + (durationMonths || 12));

  school.subscription.plan = plan;
  school.subscription.status = SubscriptionStatus.ACTIVE;
  school.subscription.endDate = endDate;
  school.subscription.maxStudents = planLimits[plan].maxStudents;
  school.subscription.maxLecturers = planLimits[plan].maxLecturers;

  await school.save();

  res.status(200).json({
    success: true,
    message: 'Subscription updated.',
    data: school,
  });
};

// ── GET ALL USERS ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const role = req.query.role as string;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Users fetched.',
    data: users,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

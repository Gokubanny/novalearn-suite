import { Document, Types } from 'mongoose';
import { Request } from 'express';

// ── ENUMS ──────────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  LECTURER = 'lecturer',
  STUDENT = 'student',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
}

export enum SubmissionStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
}

export enum GradeClass {
  FIRST_CLASS = 'First Class',
  SECOND_UPPER = 'Second Class Upper',
  SECOND_LOWER = 'Second Class Lower',
  THIRD_CLASS = 'Third Class',
  PASS = 'Pass',
  FAIL = 'Fail',
}

export enum Semester {
  FIRST = 'first',
  SECOND = 'second',
}

export enum ClassType {
  PHYSICAL = 'physical',
  ONLINE = 'online',
  HYBRID = 'hybrid',
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ALERT = 'alert',
}

// ── INTERFACES ─────────────────────────────────────────────────────────────

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

export interface ISuperAdmin extends Document {
  user: Types.ObjectId;
  permissions: string[];
  createdAt: Date;
}

export interface ISchool extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  address: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  admin: Types.ObjectId;
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    maxStudents: number;
    maxLecturers: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartment extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  school: Types.ObjectId;
  head?: Types.ObjectId;
  description?: string;
  isActive: boolean;
  matricPrefix?: string;
  matricSeparator: string;
  matricYearFormat: 'full' | 'short';
  matricSequenceDigits: number;
  matricSequence: number;
  matricLastSession?: string;
  createdAt: Date;
}

export interface ISchoolAdmin extends Document {
  user: Types.ObjectId;
  school: Types.ObjectId;
  title?: string;
  createdAt: Date;
}

export interface ILecturer extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  school: Types.ObjectId;
  department: Types.ObjectId;
  staffId: string;
  title: string;
  qualification: string;
  specialisation?: string;
  approvalStatus: ApprovalStatus;
  courses: Types.ObjectId[];
  createdAt: Date;
}

export interface IStudent extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  school: Types.ObjectId;
  department: Types.ObjectId;
  matricNumber: string;
  level: number;
  currentSemester: Semester;
  currentSession: string;
  enrolledCourses: Types.ObjectId[];
  faceImageUrl?: string;
  faceEncoding?: number[];
  approvalStatus: ApprovalStatus;
  gpa?: number;
  cgpa?: number;
  preferences?: Types.ObjectId;
  createdAt: Date;
}

export interface ICourse extends Document {
  _id: Types.ObjectId;
  title: string;
  code: string;
  school: Types.ObjectId;
  department: Types.ObjectId;
  lecturer: Types.ObjectId;
  creditUnits: number;
  semester: Semester;
  session: string;
  level: number;
  classType: ClassType;
  zoomLink?: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
    venue?: string;
  }[];
  enrolledStudents: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
}

export interface IAttendance extends Document {
  _id: Types.ObjectId;
  course: Types.ObjectId;
  school: Types.ObjectId;
  session: string;
  semester: Semester;
  date: Date;
  records: {
    student: Types.ObjectId;
    status: AttendanceStatus;
    markedAt?: Date;
    method: 'facial_recognition' | 'manual';
  }[];
  markedBy: Types.ObjectId;
  createdAt: Date;
}

export interface IResult extends Document {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  course: Types.ObjectId;
  school: Types.ObjectId;
  semester: Semester;
  session: string;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  gradePoint: number;
  gradeClass?: GradeClass;
  isPublished: boolean;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

export interface IAssignment extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  course: Types.ObjectId;
  school: Types.ObjectId;
  lecturer: Types.ObjectId;
  dueDate: Date;
  totalMarks: number;
  attachments: string[];
  submissions: {
    student: Types.ObjectId;
    fileUrl: string;
    submittedAt: Date;
    status: SubmissionStatus;
    score?: number;
    feedback?: string;
    gradedAt?: Date;
  }[];
  isActive: boolean;
  createdAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  school?: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

// ── REQUEST EXTENSION ──────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    school?: string;
    email: string;
  };
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  body: any;
}

// ── RESPONSE TYPES ─────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JwtPayload {
  id: string;
  role: UserRole;
  school?: string;
  email: string;
}
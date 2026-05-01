import crypto from 'crypto';
import { GradeClass } from '../types';

// Generate a unique matriculation number
export const generateMatricNumber = (
  schoolCode: string,
  year: number,
  sequence: number
): string => {
  const seq = String(sequence).padStart(4, '0');
  return `${schoolCode.toUpperCase()}/${year}/${seq}`;
};

// Generate a unique staff ID
export const generateStaffId = (schoolCode: string, sequence: number): string => {
  const seq = String(sequence).padStart(4, '0');
  return `${schoolCode.toUpperCase()}/STAFF/${seq}`;
};

// Calculate grade from total score (Nigerian university grading)
export const calculateGrade = (
  totalScore: number
): { grade: string; gradePoint: number; gradeClass: GradeClass } => {
  if (totalScore >= 70) {
    return { grade: 'A', gradePoint: 5.0, gradeClass: GradeClass.FIRST_CLASS };
  } else if (totalScore >= 60) {
    return { grade: 'B', gradePoint: 4.0, gradeClass: GradeClass.SECOND_UPPER };
  } else if (totalScore >= 50) {
    return { grade: 'C', gradePoint: 3.0, gradeClass: GradeClass.SECOND_LOWER };
  } else if (totalScore >= 45) {
    return { grade: 'D', gradePoint: 2.0, gradeClass: GradeClass.THIRD_CLASS };
  } else if (totalScore >= 40) {
    return { grade: 'E', gradePoint: 1.0, gradeClass: GradeClass.PASS };
  } else {
    return { grade: 'F', gradePoint: 0.0, gradeClass: GradeClass.FAIL };
  }
};

// Calculate GPA from results
export const calculateGPA = (
  results: { gradePoint: number; creditUnits: number }[]
): number => {
  if (results.length === 0) return 0;

  const totalWeightedPoints = results.reduce(
    (sum, r) => sum + r.gradePoint * r.creditUnits, 0
  );
  const totalCreditUnits = results.reduce((sum, r) => sum + r.creditUnits, 0);

  if (totalCreditUnits === 0) return 0;
  return Number((totalWeightedPoints / totalCreditUnits).toFixed(2));
};

// Get degree class from CGPA
export const getDegreeClass = (cgpa: number): GradeClass => {
  if (cgpa >= 4.5) return GradeClass.FIRST_CLASS;
  if (cgpa >= 3.5) return GradeClass.SECOND_UPPER;
  if (cgpa >= 2.4) return GradeClass.SECOND_LOWER;
  if (cgpa >= 1.5) return GradeClass.THIRD_CLASS;
  if (cgpa >= 1.0) return GradeClass.PASS;
  return GradeClass.FAIL;
};

// Generate secure random token
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash a token for safe storage
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate academic session string e.g. "2024/2025"
export const getCurrentSession = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // Academic year typically starts in September/October
  if (month >= 9) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
};

// Paginate query results
export const paginateQuery = (
  query: Record<string, unknown>,
  page: number,
  limit: number
): { skip: number; limit: number } => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

// Format response
export const formatResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  pagination?: { total: number; page: number; limit: number; totalPages: number }
) => {
  return { success, message, data, pagination };
};

// Sanitize filename
export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9._-]/gi, '_').toLowerCase();
};

// Check if subscription is valid
export const isSubscriptionActive = (endDate: Date): boolean => {
  return new Date() < new Date(endDate);
};

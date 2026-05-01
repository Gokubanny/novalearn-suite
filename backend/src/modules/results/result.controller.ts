import { Response } from 'express';
import Result from './result.model';
import Course from '../course/course.model';
import Student from '../student/student.model';
import Lecturer from '../lecturer/lecturer.model';
import Notification from '../notification/notification.model';
import { AuthRequest, NotificationType } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { calculateGrade, calculateGPA, getCurrentSession } from '../../utils/helpers';
import { sendEmail, emailTemplates } from '../../utils/email';

// ── UPLOAD RESULTS ───────────────────────────────────────────────────────────
export const uploadResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { results, semester, session } = req.body;
  // results: [{ studentId, caScore, examScore }]

  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const course = await Course.findOne({
    _id: courseId, lecturer: lecturer._id, school: req.user?.school,
  });
  if (!course) throw new AppError('Course not found or unauthorized.', 404);

  const currentSession = session || getCurrentSession();
  const uploadedResults = [];

  for (const result of results) {
    const { studentId, caScore, examScore } = result;

    if (caScore < 0 || caScore > 40) throw new AppError(`CA score must be between 0 and 40.`, 400);
    if (examScore < 0 || examScore > 60) throw new AppError(`Exam score must be between 0 and 60.`, 400);

    const totalScore = caScore + examScore;
    const { grade, gradePoint, gradeClass } = calculateGrade(totalScore);

    const savedResult = await Result.findOneAndUpdate(
      { student: studentId, course: courseId, session: currentSession },
      {
        student: studentId, course: courseId,
        school: req.user?.school, semester,
        session: currentSession, caScore, examScore,
        totalScore, grade, gradePoint, gradeClass,
        uploadedBy: req.user?.id,
      },
      { upsert: true, new: true }
    );

    uploadedResults.push(savedResult);
  }

  res.status(201).json({
    success: true,
    message: `${uploadedResults.length} result(s) uploaded successfully.`,
    data: uploadedResults,
  });
};

// ── PUBLISH RESULTS ──────────────────────────────────────────────────────────
export const publishResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { session } = req.query;

  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const course = await Course.findOne({
    _id: courseId, lecturer: lecturer._id, school: req.user?.school,
  });
  if (!course) throw new AppError('Course not found or unauthorized.', 404);

  const currentSession = (session as string) || getCurrentSession();

  const results = await Result.find({
    course: courseId,
    session: currentSession,
    isPublished: false,
  }).populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } });

  if (results.length === 0) throw new AppError('No unpublished results found for this course.', 404);

  // Publish all and notify students
  for (const result of results) {
    result.isPublished = true;
    await result.save();

    const student = result.student as any;
    if (student?.user) {
      await Notification.create({
        recipient: student.user._id,
        school: req.user?.school,
        title: 'Result Published',
        message: `Your result for ${course.code} - ${course.title} has been published.`,
        type: NotificationType.INFO,
        link: `/student/results`,
      });

      try {
        await sendEmail({
          to: student.user.email,
          subject: 'NexFord Edu - Result Published',
          html: emailTemplates.resultPublished(
            student.user.firstName,
            `${course.code} - ${course.title}`,
            result.totalScore,
            result.grade
          ),
        });
      } catch {
        // Email failure should not block publishing
      }
    }
  }

  // Recalculate GPA for all affected students
  const studentIds = [...new Set(results.map(r => (r.student as any)._id.toString()))];
  for (const studentId of studentIds) {
    await recalculateStudentGPA(studentId, req.user?.school as string, currentSession);
  }

  res.status(200).json({
    success: true,
    message: `${results.length} result(s) published.`,
  });
};

// ── HELPER: RECALCULATE GPA ──────────────────────────────────────────────────
const recalculateStudentGPA = async (
  studentId: string, schoolId: string, session: string
): Promise<void> => {
  const publishedResults = await Result.find({
    student: studentId, school: schoolId,
    session, isPublished: true,
  }).populate('course', 'creditUnits');

  const gpaData = publishedResults.map(r => ({
    gradePoint: r.gradePoint,
    creditUnits: (r.course as any).creditUnits,
  }));

  const gpa = calculateGPA(gpaData);

  // Also calculate CGPA from all sessions
  const allResults = await Result.find({
    student: studentId, school: schoolId, isPublished: true,
  }).populate('course', 'creditUnits');

  const cgpaData = allResults.map(r => ({
    gradePoint: r.gradePoint,
    creditUnits: (r.course as any).creditUnits,
  }));

  const cgpa = calculateGPA(cgpaData);

  await Student.findByIdAndUpdate(studentId, { gpa, cgpa });
};

// ── GET COURSE RESULTS ────────────────────────────────────────────────────────
export const getCourseResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const session = (req.query.session as string) || getCurrentSession();

  const results = await Result.find({
    course: courseId, school: req.user?.school, session,
  }).populate({
    path: 'student',
    populate: { path: 'user', select: 'firstName lastName email' },
    select: 'matricNumber level user',
  }).sort({ totalScore: -1 });

  res.status(200).json({ success: true, message: 'Results fetched.', data: results });
};

// ── GET STUDENT RESULTS ───────────────────────────────────────────────────────
export const getStudentResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school });
  if (!student) throw new AppError('Student profile not found.', 404);

  const session = (req.query.session as string) || getCurrentSession();

  const results = await Result.find({
    student: student._id,
    school: req.user?.school,
    isPublished: true,
    ...(session && { session }),
  }).populate('course', 'title code creditUnits semester');

  res.status(200).json({
    success: true,
    message: 'Results fetched.',
    data: {
      results,
      gpa: student.gpa,
      cgpa: student.cgpa,
    },
  });
};

// ── GET STUDENT TRANSCRIPT ─────────────────────────────────────────────────────
export const getTranscript = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school })
    .populate('user', 'firstName lastName email')
    .populate('school', 'name code')
    .populate('department', 'name code');

  if (!student) throw new AppError('Student profile not found.', 404);

  const allResults = await Result.find({
    student: student._id,
    school: req.user?.school,
    isPublished: true,
  })
    .populate('course', 'title code creditUnits semester session level')
    .sort({ session: 1, semester: 1 });

  // Group by session
  const grouped: Record<string, any[]> = {};
  allResults.forEach(result => {
    if (!grouped[result.session]) grouped[result.session] = [];
    grouped[result.session].push(result);
  });

  res.status(200).json({
    success: true,
    message: 'Transcript fetched.',
    data: {
      student,
      cgpa: student.cgpa,
      transcript: grouped,
    },
  });
};

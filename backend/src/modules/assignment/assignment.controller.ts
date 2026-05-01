import { Response } from 'express';
import Assignment from './assignment.model';
import Lecturer from '../lecturer/lecturer.model';
import Student from '../student/student.model';
import Notification from '../notification/notification.model';
import { AuthRequest, SubmissionStatus, NotificationType } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { uploadFile } from '../../config/cloudinary';
import fs from 'fs';

// ── CREATE ASSIGNMENT ─────────────────────────────────────────────────────────
export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, courseId, dueDate, totalMarks } = req.body;

  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const attachmentUrls: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files as Express.Multer.File[]) {
      const url = await uploadFile(file.path, 'nexford/assignments');
      attachmentUrls.push(url);
      fs.unlinkSync(file.path);
    }
  }

  const assignment = await Assignment.create({
    title, description,
    course: courseId,
    school: req.user?.school,
    lecturer: lecturer._id,
    dueDate: new Date(dueDate),
    totalMarks: totalMarks || 100,
    attachments: attachmentUrls,
  });

  res.status(201).json({ success: true, message: 'Assignment created.', data: assignment });
};

// ── GET LECTURER ASSIGNMENTS ───────────────────────────────────────────────────
export const getLecturerAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const assignments = await Assignment.find({ lecturer: lecturer._id, school: req.user?.school })
    .populate('course', 'title code')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: 'Assignments fetched.', data: assignments });
};

// ── GET STUDENT ASSIGNMENTS ────────────────────────────────────────────────────
export const getStudentAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school });
  if (!student) throw new AppError('Student profile not found.', 404);

  const assignments = await Assignment.find({
    course: { $in: student.enrolledCourses },
    school: req.user?.school,
    isActive: true,
  })
    .populate('course', 'title code')
    .sort({ dueDate: 1 });

  // Attach submission status for each assignment
  const assignmentsWithStatus = assignments.map(assignment => {
    const submission = assignment.submissions.find(
      s => s.student.toString() === student._id.toString()
    );
    return {
      ...assignment.toObject(),
      mySubmission: submission || null,
      isSubmitted: !!submission,
      isOverdue: new Date() > assignment.dueDate && !submission,
    };
  });

  res.status(200).json({ success: true, message: 'Assignments fetched.', data: assignmentsWithStatus });
};

// ── SUBMIT ASSIGNMENT ──────────────────────────────────────────────────────────
export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { assignmentId } = req.params;

  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school });
  if (!student) throw new AppError('Student profile not found.', 404);

  if (!req.file) throw new AppError('No file uploaded.', 400);

  const assignment = await Assignment.findOne({
    _id: assignmentId, school: req.user?.school, isActive: true,
  });
  if (!assignment) throw new AppError('Assignment not found.', 404);

  const alreadySubmitted = assignment.submissions.some(
    s => s.student.toString() === student._id.toString()
  );
  if (alreadySubmitted) throw new AppError('You have already submitted this assignment.', 409);

  const fileUrl = await uploadFile(req.file.path, 'nexford/submissions');
  fs.unlinkSync(req.file.path);

  const isLate = new Date() > assignment.dueDate;

  assignment.submissions.push({
    student: student._id,
    fileUrl,
    submittedAt: new Date(),
    status: isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED,
  });
  await assignment.save();

  res.status(200).json({
    success: true,
    message: isLate ? 'Assignment submitted (late).' : 'Assignment submitted successfully.',
  });
};

// ── GRADE SUBMISSION ───────────────────────────────────────────────────────────
export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  const { assignmentId, studentId } = req.params;
  const { score, feedback } = req.body;

  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const assignment = await Assignment.findOne({
    _id: assignmentId, lecturer: lecturer._id, school: req.user?.school,
  });
  if (!assignment) throw new AppError('Assignment not found or unauthorized.', 404);

  if (score > assignment.totalMarks) {
    throw new AppError(`Score cannot exceed total marks (${assignment.totalMarks}).`, 400);
  }

  const submissionIndex = assignment.submissions.findIndex(
    s => s.student.toString() === studentId
  );
  if (submissionIndex === -1) throw new AppError('Submission not found.', 404);

  assignment.submissions[submissionIndex].score = score;
  assignment.submissions[submissionIndex].feedback = feedback;
  assignment.submissions[submissionIndex].status = SubmissionStatus.GRADED;
  assignment.submissions[submissionIndex].gradedAt = new Date();
  await assignment.save();

  // Notify student
  const student = await Student.findById(studentId).populate<{ user: any }>('user', '_id');
  if (student) {
    await Notification.create({
      recipient: student.user._id,
      school: req.user?.school,
      title: 'Assignment Graded',
      message: `Your submission for "${assignment.title}" has been graded. Score: ${score}/${assignment.totalMarks}`,
      type: NotificationType.SUCCESS,
    });
  }

  res.status(200).json({ success: true, message: 'Submission graded.' });
};

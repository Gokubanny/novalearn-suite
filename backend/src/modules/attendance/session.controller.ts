import { Response } from 'express';
import FormData from 'form-data';
import AttendanceSession from './attendance-session.model';
import Attendance from './attendance.model';
import Course from '../course/course.model';
import Student from '../student/student.model';
import Lecturer from '../lecturer/lecturer.model';
import Notification from '../notification/notification.model';
import { AuthRequest, AttendanceStatus, NotificationType } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { getCurrentSession } from '../../utils/helpers';
import { callFaceServiceWithRetry } from '../../utils/faceServiceClient';

const FACE_SERVICE_URL = process.env.FACE_RECOGNITION_SERVICE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || '';

// ── START ATTENDANCE SESSION (Lecturer) ────────────────────────────────────────
export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { latitude, longitude, durationMinutes } = req.body;

  if (!latitude || !longitude) throw new AppError('Lecturer GPS coordinates are required.', 400);
  if (!durationMinutes || durationMinutes < 5 || durationMinutes > 120) {
    throw new AppError('Duration must be between 5 and 120 minutes.', 400);
  }

  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const course = await Course.findOne({
    _id: courseId, lecturer: lecturer._id, school: req.user?.school,
  });
  if (!course) throw new AppError('Course not found or unauthorized.', 404);

  const existingSession = await AttendanceSession.findOne({
    course: courseId, status: 'open',
    expiresAt: { $gt: new Date() },
  });
  if (existingSession) {
    throw new AppError('An attendance session is already open for this course.', 409);
  }

  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
  const currentSession = getCurrentSession();

  const session = await AttendanceSession.create({
    course: courseId,
    school: req.user?.school,
    lecturer: req.user?.id,
    lecturerLatitude: latitude,
    lecturerLongitude: longitude,
    durationMinutes,
    expiresAt,
    session: currentSession,
    semester: course.semester,
    status: 'open',
  });

  const enrolledStudents = await Student.find({
    _id: { $in: course.enrolledStudents },
  }).populate<{ user: any }>('user', '_id');

  const notifications = enrolledStudents.map(student => ({
    recipient: student.user._id,
    school: req.user?.school,
    title: 'Attendance Session Open',
    message: `Attendance for ${course.code} - ${course.title} is now open. You have ${durationMinutes} minutes to submit.`,
    type: NotificationType.ALERT,
    link: `/student/attendance/${session._id}`,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json({
    success: true,
    message: `Attendance session started. Students have ${durationMinutes} minutes to submit.`,
    data: {
      sessionId: session._id,
      courseId,
      courseCode: course.code,
      expiresAt,
      durationMinutes,
    },
  });
};

// ── END SESSION EARLY (Lecturer) ──────────────────────────────────────────────
export const endSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  const session = await AttendanceSession.findOne({
    _id: sessionId,
    lecturer: req.user?.id,
    status: 'open',
  });
  if (!session) throw new AppError('Session not found or already closed.', 404);

  session.status = 'closed';
  await session.save();

  await finalizeAttendance(session);

  res.status(200).json({
    success: true,
    message: 'Session closed and attendance finalized.',
    data: {
      presentCount: session.presentStudents.length,
      submittedCount: session.submittedStudents.length,
    },
  });
};

// ── GET ACTIVE SESSION FOR COURSE ─────────────────────────────────────────────
export const getActiveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;

  const session = await AttendanceSession.findOne({
    course: courseId,
    status: 'open',
    expiresAt: { $gt: new Date() },
  }).populate('course', 'title code');

  if (!session) {
    res.status(200).json({
      success: true,
      message: 'No active session.',
      data: null,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Active session found.',
    data: {
      _id: session._id,
      id: session._id,
      sessionId: session._id,
      expiresAt: session.expiresAt,
      durationMinutes: session.durationMinutes,
      submittedCount: session.submittedStudents.length,
    },
  });
};

// ── STUDENT SELFIE SUBMISSION ──────────────────────────────────────────────────
export const submitSelfie = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  const { latitude, longitude } = req.body;

  if (!req.file) throw new AppError('Selfie image is required.', 400);
  if (!latitude || !longitude) throw new AppError('Your GPS location is required.', 400);

  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school });
  if (!student) throw new AppError('Student profile not found.', 404);

  const fileBuffer = req.file.buffer;
  const studentIdStr = student._id.toString();

  try {
    const getFormData = () => {
      const formData = new FormData();
      formData.append('student_id', studentIdStr);
      formData.append('session_id', sessionId);
      formData.append('student_latitude', String(latitude));
      formData.append('student_longitude', String(longitude));
      formData.append('image', fileBuffer, {
        filename: 'selfie.jpg',
        contentType: 'image/jpeg',
      });
      return formData;
    };

    const faceResponse = await callFaceServiceWithRetry(
      `${FACE_SERVICE_URL}/recognize/selfie`,
      getFormData,
      { 'x-api-key': INTERNAL_API_KEY },
      2,
      120000
    );

    const result = faceResponse.data;

    if (result.marked_present) {
      await AttendanceSession.findByIdAndUpdate(sessionId, {
        $addToSet: { presentStudents: student._id, submittedStudents: student._id }
      });
    } else {
      await AttendanceSession.findByIdAndUpdate(sessionId, {
        $addToSet: { submittedStudents: student._id },
      });
    }

    res.status(200).json({
      success: result.success,
      message: result.message,
      data: {
        faceMatched: result.face_matched,
        locationValid: result.location_valid,
        distanceMetres: result.distance_metres,
        markedPresent: result.marked_present,
        alreadySubmitted: result.already_submitted || false,
      },
    });
  } catch (error: any) {
    console.error('Selfie verification error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code,
    });

    if (error.response?.status === 429) {
      throw new AppError(
        'Face recognition service is busy. Please wait a moment and try again.',
        429
      );
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new AppError(
        'Face recognition service is taking too long to respond. Please try again in a minute.',
        504
      );
    }

    if (error.response?.data?.detail) {
      throw new AppError(error.response.data.detail, error.response.status || 400);
    }

    throw new AppError('Attendance submission failed. Please try again.', 503);
  }
};

// ── HELPER: FINALIZE ATTENDANCE RECORD ────────────────────────────────────────
export const finalizeAttendance = async (session: any): Promise<void> => {
  try {
    const course = await Course.findById(session.course);
    if (!course) return;

    const enrolledStudents = course.enrolledStudents;

    const records = enrolledStudents.map((studentId: any) => {
      const isPresent = session.presentStudents.some(
        (p: any) => p.toString() === studentId.toString()
      );
      return {
        student: studentId,
        status: isPresent ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
        markedAt: isPresent ? new Date() : undefined,
        method: 'facial_recognition' as const,
      };
    });

    await Attendance.create({
      course: session.course,
      school: session.school,
      session: session.session,
      semester: session.semester,
      date: session.createdAt,
      records,
      markedBy: session.lecturer,
    });
  } catch (error) {
    console.error('Error finalizing attendance:', error);
  }
};

// ── GET SESSION RESULTS (Lecturer) ────────────────────────────────────────────
export const getSessionResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  const session = await AttendanceSession.findOne({
    _id: sessionId,
    lecturer: req.user?.id,
  })
    .populate({ path: 'presentStudents', populate: { path: 'user', select: 'firstName lastName' }, select: 'matricNumber user' })
    .populate('course', 'title code');

  if (!session) throw new AppError('Session not found.', 404);

  const course = await Course.findById(session.course);
  const totalEnrolled = course?.enrolledStudents.length || 0;

  res.status(200).json({
    success: true,
    message: 'Session results fetched.',
    data: {
      sessionId: session._id,
      status: session.status,
      totalEnrolled,
      presentCount: session.presentStudents.length,
      absentCount: totalEnrolled - session.presentStudents.length,
      presentStudents: session.presentStudents,
      expiresAt: session.expiresAt,
    },
  });
};
import { Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import Attendance from './attendance.model';
import Course from '../course/course.model';
import Student from '../student/student.model';
import Lecturer from '../lecturer/lecturer.model';
import {
  AuthRequest, AttendanceStatus, Semester,
} from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { getCurrentSession } from '../../utils/helpers';

// ── MARK ATTENDANCE (FACIAL RECOGNITION) ────────────────────────────────────
export const markAttendanceFacial = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;

  if (!req.file) throw new AppError('No image uploaded for facial recognition.', 400);

  // Verify lecturer owns this course
  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const course = await Course.findOne({
    _id: courseId, lecturer: lecturer._id, school: req.user?.school,
  }).populate('enrolledStudents');
  if (!course) throw new AppError('Course not found or unauthorized.', 404);

  // Call Python facial recognition microservice
  let recognizedStudentIds: string[] = [];
  try {
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: 'attendance.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('school_id', req.user?.school as string);

    const faceResponse = await axios.post(
      `${process.env.FACE_RECOGNITION_SERVICE_URL}/recognize`,
      formData,
      { headers: formData.getHeaders(), timeout: 30000 }
    );

    recognizedStudentIds = faceResponse.data.recognized_students || [];
  } catch (error) {
    throw new AppError(
      'Facial recognition service unavailable. Please try manual attendance.',
      503
    );
  }

  // Build attendance records for all enrolled students
  const session = getCurrentSession();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if attendance already exists for today
  const existingAttendance = await Attendance.findOne({
    course: courseId,
    date: { $gte: today },
  });
  if (existingAttendance) throw new AppError('Attendance has already been marked for this class today.', 409);

  const records = (course.enrolledStudents as any[]).map((student: any) => {
    const studentId = student._id.toString();
    const isRecognized = recognizedStudentIds.includes(studentId);
    return {
      student: student._id,
      status: isRecognized ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
      markedAt: isRecognized ? new Date() : undefined,
      method: 'facial_recognition' as const,
    };
  });

  const attendance = await Attendance.create({
    course: courseId,
    school: req.user?.school,
    session,
    semester: course.semester as Semester,
    date: new Date(),
    records,
    markedBy: req.user?.id,
  });

  const presentCount = records.filter(r => r.status === AttendanceStatus.PRESENT).length;

  res.status(201).json({
    success: true,
    message: `Attendance marked. ${presentCount} of ${records.length} students recognised.`,
    data: {
      attendanceId: attendance._id,
      totalStudents: records.length,
      present: presentCount,
      absent: records.length - presentCount,
    },
  });
};

// ── MARK ATTENDANCE (MANUAL) ─────────────────────────────────────────────────
export const markAttendanceManual = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { records } = req.body; // Array of { studentId, status }

  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const course = await Course.findOne({
    _id: courseId, lecturer: lecturer._id, school: req.user?.school,
  });
  if (!course) throw new AppError('Course not found or unauthorized.', 404);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAttendance = await Attendance.findOne({
    course: courseId,
    date: { $gte: today },
  });
  if (existingAttendance) throw new AppError('Attendance already marked for today.', 409);

  const session = getCurrentSession();
  const attendanceRecords = records.map((r: { studentId: string; status: AttendanceStatus }) => ({
    student: r.studentId,
    status: r.status,
    markedAt: r.status === AttendanceStatus.PRESENT ? new Date() : undefined,
    method: 'manual' as const,
  }));

  const attendance = await Attendance.create({
    course: courseId,
    school: req.user?.school,
    session,
    semester: course.semester as Semester,
    date: new Date(),
    records: attendanceRecords,
    markedBy: req.user?.id,
  });

  res.status(201).json({ success: true, message: 'Manual attendance recorded.', data: attendance });
};

// ── GET COURSE ATTENDANCE HISTORY ────────────────────────────────────────────
export const getCourseAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Attendance.find({ course: courseId, school: req.user?.school })
      .populate('records.student', 'matricNumber user')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments({ course: courseId, school: req.user?.school }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Attendance records fetched.',
    data: records,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};

// ── GET STUDENT ATTENDANCE SUMMARY ───────────────────────────────────────────
export const getStudentAttendanceSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school });
  if (!student) throw new AppError('Student profile not found.', 404);

  const { courseId } = req.params;
  const session = getCurrentSession();

  const attendanceRecords = await Attendance.find({
    course: courseId,
    school: req.user?.school,
    session,
    'records.student': student._id,
  });

  let present = 0, absent = 0, late = 0;
  attendanceRecords.forEach(record => {
    const studentRecord = record.records.find(
      r => r.student.toString() === student._id.toString()
    );
    if (studentRecord) {
      if (studentRecord.status === AttendanceStatus.PRESENT) present++;
      else if (studentRecord.status === AttendanceStatus.ABSENT) absent++;
      else if (studentRecord.status === AttendanceStatus.LATE) late++;
    }
  });

  const total = present + absent + late;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  res.status(200).json({
    success: true,
    message: 'Attendance summary fetched.',
    data: { total, present, absent, late, percentage },
  });
};

// ── REGISTER STUDENT FACE ─────────────────────────────────────────────────────
export const registerStudentFace = async (req: AuthRequest, res: Response): Promise<void> => {
  const student = await Student.findOne({ user: req.user?.id, school: req.user?.school });
  if (!student) throw new AppError('Student profile not found.', 404);

  if (!req.file) throw new AppError('No image uploaded.', 400);

  // Send face to Python service for encoding
  try {
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: 'face.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('student_id', student._id.toString());
    formData.append('school_id', req.user?.school as string);

    const response = await axios.post(
      `${process.env.FACE_RECOGNITION_SERVICE_URL}/register`,
      formData,
      { headers: formData.getHeaders(), timeout: 30000 }
    );

    const { face_encoding, image_url } = response.data;

    await Student.findByIdAndUpdate(student._id, {
      faceEncoding: face_encoding,
      faceImageUrl: image_url,
    });

    res.status(200).json({
      success: true,
      message: 'Face registered successfully for attendance.',
      data: { faceImageUrl: image_url },
    });
  } catch {
    throw new AppError('Face registration failed. Please ensure your face is clearly visible.', 400);
  }
};

import { Response } from 'express';
import FormData from 'form-data';
import mongoose from 'mongoose';
import Attendance from './attendance.model';
import Course from '../course/course.model';
import Student from '../student/student.model';
import Lecturer from '../lecturer/lecturer.model';
import {
  AuthRequest, AttendanceStatus, Semester,
} from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { getCurrentSession } from '../../utils/helpers';
import { callFaceServiceWithRetry } from '../../utils/faceServiceClient';
import { mergeIntoDayRecord, MergeEntry } from './attendance.merge';

// ── MARK ATTENDANCE (FACIAL RECOGNITION) ────────────────────────────────────
export const markAttendanceFacial = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;

  if (!req.file) throw new AppError('No image uploaded for facial recognition.', 400);

  const fileBuffer = req.file.buffer;
  const schoolId = req.user?.school as string;

  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const course = await Course.findOne({
    _id: courseId, lecturer: lecturer._id, school: req.user?.school,
  }).populate('enrolledStudents');
  if (!course) throw new AppError('Course not found or unauthorized.', 404);

  let recognizedStudentIds: string[] = [];
  try {
    const faceServiceUrl = process.env.FACE_RECOGNITION_SERVICE_URL;
    if (!faceServiceUrl) {
      throw new AppError('Face recognition service URL not configured.', 500);
    }

    console.log(`Calling face service: ${faceServiceUrl}/recognize/class`);

    const getFormData = () => {
      const formData = new FormData();
      formData.append('image', fileBuffer, {
        filename: 'attendance.jpg',
        contentType: 'image/jpeg',
      });
      formData.append('school_id', schoolId);
      return formData;
    };

    const faceResponse = await callFaceServiceWithRetry(
      `${faceServiceUrl}/recognize/class`,
      getFormData,
      {
        'x-api-key': process.env.INTERNAL_API_KEY || ''
      },
      2,
      120000
    );

    recognizedStudentIds = faceResponse.data.recognized_students || [];
    console.log(`Recognized ${recognizedStudentIds.length} students`);
  } catch (error: any) {
    console.error('Facial recognition error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });

    if (error.response?.status === 429) {
      throw new AppError(
        'Face recognition service is busy. Please wait a moment and try manual attendance.',
        429
      );
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new AppError(
        'Face recognition service is taking too long. Please try manual attendance.',
        504
      );
    }

    throw new AppError(
      'Facial recognition service unavailable. Please try manual attendance.',
      503
    );
  }

  // Merge into the day's single record (present wins) instead of refusing
  // with a 409 when a record for today already exists.
  const roster = (course.enrolledStudents as any[]).map((student: any) => student._id.toString());
  const rosterSet = new Set(roster);

  const entries: MergeEntry[] = recognizedStudentIds
    .filter((id) => rosterSet.has(id))
    .map((id) => ({
      student: id,
      status: AttendanceStatus.PRESENT,
      method: 'facial_recognition' as const,
    }));

  const { doc, created } = await mergeIntoDayRecord({
    course: courseId,
    school: schoolId,
    session: getCurrentSession(),
    semester: course.semester as Semester,
    markedBy: req.user?.id as string,
    roster,
    entries,
    defaultMethod: 'facial_recognition',
  });

  const presentCount = doc.records.filter((r) => r.status === AttendanceStatus.PRESENT).length;

  res.status(created ? 201 : 200).json({
    success: true,
    message: `Attendance marked. ${presentCount} of ${doc.records.length} students present.`,
    data: {
      attendanceId: doc._id,
      totalStudents: doc.records.length,
      present: presentCount,
      absent: doc.records.length - presentCount,
    },
  });
};

// ── MARK ATTENDANCE (MANUAL) ─────────────────────────────────────────────────
export const markAttendanceManual = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { records } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    throw new AppError('Attendance records are required.', 400);
  }

  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const course = await Course.findOne({
    _id: courseId, lecturer: lecturer._id, school: req.user?.school,
  });
  if (!course) throw new AppError('Course not found or unauthorized.', 404);

  const roster = course.enrolledStudents.map((id: any) => id.toString());
  const rosterSet = new Set(roster);
  const validStatuses = new Set<string>(Object.values(AttendanceStatus));

  // Keep only enrolled students with a recognised status.
  const entries: MergeEntry[] = records
    .filter(
      (r: { studentId: string; status: AttendanceStatus }) =>
        r &&
        mongoose.isValidObjectId(r.studentId) &&
        rosterSet.has(String(r.studentId)) &&
        validStatuses.has(r.status)
    )
    .map((r: { studentId: string; status: AttendanceStatus }) => ({
      student: String(r.studentId),
      status: r.status,
      method: 'manual' as const,
    }));

  // Merge into the day's single record (present wins) instead of refusing
  // with a 409 when a record for today already exists.
  const { doc, created } = await mergeIntoDayRecord({
    course: courseId,
    school: req.user?.school as string,
    session: getCurrentSession(),
    semester: course.semester as Semester,
    markedBy: req.user?.id as string,
    roster,
    entries,
    defaultMethod: 'manual',
  });

  res.status(created ? 201 : 200).json({
    success: true,
    message: created
      ? 'Manual attendance recorded.'
      : "Today's attendance record updated. Students already marked present were kept.",
    data: doc,
  });
};

// ── GET COURSE ATTENDANCE HISTORY ────────────────────────────────────────────
export const getCourseAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    Attendance.find({ course: courseId, school: req.user?.school })
      .populate({
        path: 'records.student',
        select: 'matricNumber user',
        populate: { path: 'user', select: 'firstName lastName' },
      })
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

  const fileBuffer = req.file.buffer;
  const studentId = student._id.toString();
  const schoolId = req.user?.school as string;

  try {
    const faceServiceUrl = process.env.FACE_RECOGNITION_SERVICE_URL;
    if (!faceServiceUrl) {
      console.error('FACE_RECOGNITION_SERVICE_URL environment variable is not set');
      throw new AppError('Face recognition service not configured.', 500);
    }

    console.log(`Calling face service at: ${faceServiceUrl}/register`);
    console.log(`Student ID: ${studentId}, School ID: ${schoolId}`);

    const getFormData = () => {
      const formData = new FormData();
      formData.append('image', fileBuffer, {
        filename: 'face.jpg',
        contentType: 'image/jpeg',
      });
      formData.append('student_id', studentId);
      formData.append('school_id', schoolId);
      return formData;
    };

    const response = await callFaceServiceWithRetry(
      `${faceServiceUrl}/register`,
      getFormData,
      {
        'x-api-key': process.env.INTERNAL_API_KEY || ''
      },
      2,
      120000
    );

    console.log('Face service response:', response.data);

    const { face_encoding, image_url } = response.data;

    if (!face_encoding) {
      throw new AppError('Face service did not return encoding. Please try again with a clearer image.', 400);
    }

    await Student.findByIdAndUpdate(student._id, {
      faceEncoding: face_encoding,
      faceImageUrl: image_url,
    });

    res.status(200).json({
      success: true,
      message: 'Face registered successfully for attendance.',
      data: { faceImageUrl: image_url },
    });
  } catch (error: any) {
    console.error('Face registration error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new AppError('Face recognition service is unavailable. Please try again later.', 503);
    }

    if (error.response?.status === 429) {
      throw new AppError(
        'Face service is currently busy. Please wait 30 seconds and try again.',
        429
      );
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new AppError(
        'Face service is taking too long. Please try again with a smaller image.',
        504
      );
    }

    if (error.response?.status === 503) {
      throw new AppError('Face service is temporarily unavailable. Please try again later.', 503);
    }

    if (error.response?.data?.detail) {
      throw new AppError(`Face registration failed: ${error.response.data.detail}`, 400);
    }

    throw new AppError('Face registration failed. Please ensure your face is clearly visible in good lighting.', 400);
  }
};
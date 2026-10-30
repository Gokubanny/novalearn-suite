import { Response } from 'express';
import FormData from 'form-data';
import mongoose, { Types } from 'mongoose';
import AttendanceSession from './attendance-session.model';
import Course from '../course/course.model';
import Student from '../student/student.model';
import Lecturer from '../lecturer/lecturer.model';
import Notification from '../notification/notification.model';
import { AuthRequest, AttendanceStatus, NotificationType, Semester, UserRole } from '../../types';
import { AppError } from '../../middleware/error.middleware';
import { getCurrentSession } from '../../utils/helpers';
import { callFaceServiceWithRetry } from '../../utils/faceServiceClient';
import { emitToUser } from '../../realtime/socket';
import { mergeIntoDayRecord, MergeEntry } from './attendance.merge';

const FACE_SERVICE_URL = process.env.FACE_RECOGNITION_SERVICE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || '';

// Students can only submit until a session's expiry time. After that the
// lecturer still has this long to review the list and mark anyone who was in
// class but could not verify, before the session is saved automatically.
export const REVIEW_GRACE_MINUTES = 15;
const REVIEW_GRACE_MS = REVIEW_GRACE_MINUTES * 60 * 1000;
const SWEEP_INTERVAL_MS = 60 * 1000;

const reviewDeadlineOf = (expiresAt: Date): Date =>
  new Date(expiresAt.getTime() + REVIEW_GRACE_MS);

// ── HELPER: FINALIZE ATTENDANCE RECORD ────────────────────────────────────────
// Saves a closed session into the course's single record for that day.
// Throws on failure so the caller can reopen the session instead of losing it.
export const finalizeAttendance = async (session: any): Promise<void> => {
  const course = await Course.findById(session.course);
  if (!course) {
    console.warn(`Session ${session._id}: course no longer exists, nothing to save.`);
    return;
  }

  const roster = course.enrolledStudents.map((id: any) => id.toString());
  const presentIds = new Set<string>((session.presentStudents ?? []).map((id: any) => id.toString()));
  const manualIds = new Set<string>((session.manualStudents ?? []).map((id: any) => id.toString()));

  const entries: MergeEntry[] = roster
    .filter((id: string) => presentIds.has(id))
    .map((id: string) => ({
      student: id,
      status: AttendanceStatus.PRESENT,
      method: manualIds.has(id) ? ('manual' as const) : ('facial_recognition' as const),
    }));

  await mergeIntoDayRecord({
    course: session.course.toString(),
    school: session.school.toString(),
    session: session.session,
    semester: session.semester as Semester,
    markedBy: session.lecturer.toString(),
    roster,
    entries,
    defaultMethod: 'facial_recognition',
    date: session.createdAt, // the day the class actually took place
  });
};

// ── HELPER: CLOSE A SESSION AND SAVE IT (atomic) ──────────────────────────────
// Flipping open → closed is a single database step, so if the lecturer presses
// End at the same moment the sweep runs, only one of them wins and the other
// gets null back. If saving fails the session is reopened, so nothing is lost
// and the sweep (or the lecturer) can try again.
const closeAndFinalize = async (filter: any) => {
  const claimed = await AttendanceSession.findOneAndUpdate(
    { ...filter, status: 'open' },
    { $set: { status: 'closed' } },
    { new: true }
  );
  if (!claimed) return null;

  try {
    await finalizeAttendance(claimed);
  } catch (error) {
    await AttendanceSession.updateOne({ _id: claimed._id }, { $set: { status: 'open' } });
    throw error;
  }
  return claimed;
};

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

  // An earlier session for this course that expired but was never reviewed is
  // saved now — starting a new session means the review is over.
  const staleSessions = await AttendanceSession.find({
    course: courseId, status: 'open', expiresAt: { $lte: new Date() },
  }).select('_id');
  for (const stale of staleSessions) {
    try {
      await closeAndFinalize({ _id: stale._id });
    } catch (error) {
      console.error('Could not save an expired session before starting a new one:', error);
    }
  }

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
    // create() (not insertMany()) — insertMany() skips document middleware,
    // so the Notification model's post('save') hook (which pushes the
    // realtime event over the socket) would silently never fire.
    await Notification.create(notifications);
  }

  res.status(201).json({
    success: true,
    message: `Attendance session started. Students have ${durationMinutes} minutes to submit.`,
    data: {
      sessionId: session._id,
      courseId,
      courseCode: course.code,
      expiresAt,
      reviewDeadline: reviewDeadlineOf(expiresAt),
      durationMinutes,
    },
  });
};

// ── END SESSION AND SAVE (Lecturer) ───────────────────────────────────────────
// Also used to save a session that has expired but is still inside the review
// window. Manual marks made while the session was open are already stored on
// the session, so they are included automatically.
export const endSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  if (!mongoose.isValidObjectId(sessionId)) throw new AppError('Invalid session id.', 400);

  let session;
  try {
    session = await closeAndFinalize({ _id: sessionId, lecturer: req.user?.id });
  } catch (error) {
    console.error('Error finalizing attendance:', error);
    throw new AppError('Could not save attendance. The session is still open — please try again.', 500);
  }
  if (!session) throw new AppError('Session not found or already closed.', 404);

  res.status(200).json({
    success: true,
    message: 'Session closed and attendance finalized.',
    data: {
      presentCount: session.presentStudents.length,
      manualCount: (session.manualStudents ?? []).length,
      submittedCount: session.submittedStudents.length,
    },
  });
};

// ── GET ACTIVE SESSION FOR COURSE ─────────────────────────────────────────────
// Students only ever see a session that is genuinely open for submissions.
// The lecturer also gets back a session that has expired but is still inside
// the review window, so they can finish marking and save it (even after a
// page refresh).
export const getActiveSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const { courseId } = req.params;

  const isLecturer = req.user?.role === UserRole.LECTURER;
  const now = new Date();

  const filter: any = { course: courseId, status: 'open' };
  if (isLecturer) {
    filter.lecturer = req.user?.id;
    filter.expiresAt = { $gt: new Date(now.getTime() - REVIEW_GRACE_MS) };
  } else {
    filter.expiresAt = { $gt: now };
  }

  const session = await AttendanceSession.findOne(filter)
    .sort({ createdAt: -1 })
    .populate('course', 'title code');

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
      reviewDeadline: reviewDeadlineOf(session.expiresAt),
      inReview: session.expiresAt.getTime() <= now.getTime(),
      durationMinutes: session.durationMinutes,
      submittedCount: session.submittedStudents.length,
    },
  });
};

// ── HELPER: RECORD AN ATTEMPT (increment if exists, else push) ───────────────
// Mongo has no single native "upsert into array + increment" operator, so
// this is the standard two-step idiom: try to bump an existing entry via the
// positional $ operator, and only push a brand-new entry if nothing matched.
const recordAttempt = async (
  sessionId: string,
  studentId: any,
  status: 'present' | 'face_mismatch' | 'location_invalid'
): Promise<void> => {
  const now = new Date();

  const incremented = await AttendanceSession.updateOne(
    { _id: sessionId, 'attemptCounts.student': studentId },
    {
      $inc: { 'attemptCounts.$.count': 1 },
      $set: { 'attemptCounts.$.lastStatus': status, 'attemptCounts.$.lastAttemptAt': now },
    }
  );

  if (incremented.matchedCount === 0) {
    await AttendanceSession.updateOne(
      { _id: sessionId },
      {
        $push: {
          attemptCounts: { student: studentId, count: 1, lastStatus: status, lastAttemptAt: now },
        },
      }
    );
  }
};

// ── HELPER: PUSH A LIVE "SOMETHING CHANGED" SIGNAL TO THE SESSION'S LECTURER ──
// Signal-only, not a data payload: the open panel just refetches its existing
// getSessionResults() on receipt, so there's one source of truth for the
// actual numbers either way. Best-effort — must never break the real
// attendance write if the lookup or the push fails.
const notifyLecturerOfSessionUpdate = async (sessionId: string): Promise<void> => {
  try {
    const session = await AttendanceSession.findById(sessionId).select('lecturer').lean();
    if (session?.lecturer) {
      emitToUser(session.lecturer.toString(), 'attendance:session-update', { sessionId });
    }
  } catch {
    /* ignore — realtime is best-effort */
  }
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

    // Classify this attempt for the lecturer's attempt log. Only fires on a
    // completed verification (not on network/infra errors, which are caught
    // below and don't represent a real face/location outcome).
    const attemptStatus: 'present' | 'face_mismatch' | 'location_invalid' = result.marked_present
      ? 'present'
      : result.location_valid === false
        ? 'location_invalid'
        : 'face_mismatch';
    await recordAttempt(sessionId, student._id, attemptStatus);

    // Let the lecturer's open panel know something changed — on both a
    // success and a recorded failure, since "attempted, not present" is
    // also shown live.
    await notifyLecturerOfSessionUpdate(sessionId);

    // Only bookkeep submittedStudents/presentStudents on genuine success —
    // Python's own has_student_submitted() check reads submittedStudents to
    // decide whether to 409 a retry, so writing here on failure would
    // permanently lock a student out after one bad attempt.
    if (result.marked_present) {
      await AttendanceSession.findByIdAndUpdate(sessionId, {
        $addToSet: { presentStudents: student._id, submittedStudents: student._id }
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

// ── MARK / UNMARK A STUDENT MANUALLY WHILE THE SESSION IS OPEN (Lecturer) ─────
// For students who were in class but could not verify by face. The student is
// also recorded as "submitted", so a later selfie attempt gets a clear
// "already submitted" answer instead of spending a face check. Removing a
// manual mark reverses all of that. Students verified by face are locked.
export const setManualPresence = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId, studentId } = req.params;
  const { present } = req.body;

  if (typeof present !== 'boolean') throw new AppError('"present" must be true or false.', 400);
  if (!mongoose.isValidObjectId(sessionId) || !mongoose.isValidObjectId(studentId)) {
    throw new AppError('Invalid session or student id.', 400);
  }

  const session = await AttendanceSession.findOne({ _id: sessionId, lecturer: req.user?.id });
  if (!session) throw new AppError('Session not found.', 404);
  if (session.status !== 'open') {
    throw new AppError('This session is already saved. Use Manual Attendance to add students.', 409);
  }

  const course = await Course.findOne({ _id: session.course, school: req.user?.school });
  const enrolled = !!course && course.enrolledStudents.some((id) => id.toString() === studentId);
  if (!enrolled) throw new AppError('That student is not enrolled in this course.', 400);

  const sid = new Types.ObjectId(studentId);
  const closedMeanwhile = async (): Promise<boolean> =>
    !(await AttendanceSession.exists({ _id: sessionId, status: 'open' }));

  if (present) {
    // Matches only if the student is not already present (by face or by hand).
    const result = await AttendanceSession.updateOne(
      { _id: sessionId, status: 'open', presentStudents: { $ne: sid } },
      { $addToSet: { presentStudents: sid, manualStudents: sid, submittedStudents: sid } }
    );

    if (result.matchedCount === 0) {
      if (await closedMeanwhile()) {
        throw new AppError('This session was just saved. Use Manual Attendance to add students.', 409);
      }
      res.status(200).json({
        success: true,
        message: 'Already marked present.',
        data: { studentId, present: true, changed: false },
      });
      return;
    }
  } else {
    // Matches only if this student was marked by hand.
    const result = await AttendanceSession.updateOne(
      { _id: sessionId, status: 'open', manualStudents: sid },
      { $pull: { presentStudents: sid, manualStudents: sid, submittedStudents: sid } }
    );

    if (result.matchedCount === 0) {
      if (await closedMeanwhile()) {
        throw new AppError('This session was just saved. Use Manual Attendance to change it.', 409);
      }
      const inPresent = session.presentStudents.some((id) => id.toString() === studentId);
      if (inPresent) {
        throw new AppError('This student was verified by face and cannot be removed.', 409);
      }
      res.status(200).json({
        success: true,
        message: 'Student was not marked present.',
        data: { studentId, present: false, changed: false },
      });
      return;
    }
  }

  await notifyLecturerOfSessionUpdate(sessionId);

  res.status(200).json({
    success: true,
    message: present ? 'Marked present manually.' : 'Manual mark removed.',
    data: { studentId, present, changed: true },
  });
};

// ── GET SESSION RESULTS (Lecturer) ────────────────────────────────────────────
export const getSessionResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  const session = await AttendanceSession.findOne({
    _id: sessionId,
    lecturer: req.user?.id,
  })
    .populate({ path: 'presentStudents', populate: { path: 'user', select: 'firstName lastName' }, select: 'matricNumber user' })
    .populate({ path: 'attemptCounts.student', populate: { path: 'user', select: 'firstName lastName' }, select: 'matricNumber user' })
    .populate('course', 'title code');

  if (!session) throw new AppError('Session not found.', 404);

  const course = await Course.findById(session.course);
  const totalEnrolled = course?.enrolledStudents.length || 0;

  const presentIds = new Set(
    session.presentStudents.map((s: any) => s._id.toString())
  );
  const manualIds = new Set<string>(
    (session.manualStudents ?? []).map((id: any) => id.toString())
  );

  const attemptByStudent = new Map<string, any>();
  (session.attemptCounts || []).forEach((a: any) => {
    if (a.student) attemptByStudent.set(a.student._id.toString(), a);
  });

  // Present students, with how they were marked and their attempt count
  // (useful to see e.g. "took 3 tries" even for a successful student).
  const presentStudents = session.presentStudents.map((s: any) => {
    const id = s._id.toString();
    const a = attemptByStudent.get(id);
    const isManual = manualIds.has(id);
    return {
      _id: s._id,
      matricNumber: s.matricNumber,
      user: s.user,
      method: isManual ? 'manual' : 'facial_recognition',
      attempts: a?.count ?? (isManual ? 0 : 1),
    };
  });

  // Enrolled students who tried at least once but never succeeded.
  const attemptedNotPresent = (session.attemptCounts || [])
    .filter((a: any) => a.student && !presentIds.has(a.student._id.toString()))
    .map((a: any) => ({
      _id: a.student._id,
      matricNumber: a.student.matricNumber,
      user: a.student.user,
      attempts: a.count,
      lastStatus: a.lastStatus,
      lastAttemptAt: a.lastAttemptAt,
    }));

  res.status(200).json({
    success: true,
    message: 'Session results fetched.',
    data: {
      sessionId: session._id,
      status: session.status,
      totalEnrolled,
      presentCount: session.presentStudents.length,
      manualCount: presentStudents.filter((s) => s.method === 'manual').length,
      absentCount: totalEnrolled - session.presentStudents.length,
      presentStudents,
      attemptedNotPresent,
      attemptedNotPresentCount: attemptedNotPresent.length,
      expiresAt: session.expiresAt,
      reviewDeadline: reviewDeadlineOf(session.expiresAt),
      graceMinutes: REVIEW_GRACE_MINUTES,
    },
  });
};

// ── SWEEP: SAVE SESSIONS NOBODY ENDED ─────────────────────────────────────────
// Finds sessions still marked open whose review window has passed, and saves
// them. It reads expiry times from the database (no in-memory timers), so a
// restart or a sleeping Render instance only delays the save — the next sweep
// catches up.
export const closeExpiredSessions = async (): Promise<number> => {
  const cutoff = new Date(Date.now() - REVIEW_GRACE_MS);
  const overdue = await AttendanceSession.find({
    status: 'open',
    expiresAt: { $lte: cutoff },
  }).select('_id');

  let saved = 0;
  for (const { _id } of overdue) {
    try {
      const closed = await closeAndFinalize({ _id });
      if (closed) saved++;
    } catch (error) {
      console.error(`Attendance sweep could not save session ${_id}:`, error);
    }
  }
  return saved;
};

let sweepTimer: NodeJS.Timeout | null = null;
let sweepRunning = false;

export const startSessionSweep = (): void => {
  if (sweepTimer) return;

  const run = async (): Promise<void> => {
    if (sweepRunning) return; // never let two sweeps overlap
    sweepRunning = true;
    try {
      const saved = await closeExpiredSessions();
      if (saved > 0) console.log(`🧹 Attendance sweep saved ${saved} expired session(s).`);
    } catch (error) {
      console.error('Attendance sweep failed:', error);
    } finally {
      sweepRunning = false;
    }
  };

  void run(); // catch up straight away after a restart or a sleep
  sweepTimer = setInterval(run, SWEEP_INTERVAL_MS);
  sweepTimer.unref(); // never keeps the process alive on shutdown
  console.log('✅ Attendance session sweep started');
};
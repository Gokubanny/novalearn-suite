import { Response } from 'express';
import Lecturer from './lecturer.model';
import Course from '../course/course.model';
import Student from '../student/student.model';
import Attendance from '../attendance/attendance.model';
import Assignment from '../assignment/assignment.model';
import Result from '../results/result.model';
import { AuthRequest, AttendanceStatus } from '../../types';
import { AppError } from '../../middleware/error.middleware';

type RiskLevel = 'low' | 'medium' | 'high';
const riskRank = (r: RiskLevel): number => (r === 'high' ? 2 : r === 'medium' ? 1 : 0);

// ── GET STUDENT PERFORMANCE (lecturer's own courses) ────────────────────────
export const getStudentPerformance = async (req: AuthRequest, res: Response): Promise<void> => {
  const lecturer = await Lecturer.findOne({ user: req.user?.id, school: req.user?.school });
  if (!lecturer) throw new AppError('Lecturer profile not found.', 404);

  const courses = await Course.find({ lecturer: lecturer._id, school: req.user?.school })
    .select('enrolledStudents');
  const courseIds = courses.map((c) => c._id);

  // studentId -> set of this lecturer's course IDs they're enrolled in
  const studentCourseMap: Record<string, Set<string>> = {};
  const courseStudentIds: Record<string, string[]> = {};
  courses.forEach((c: any) => {
    const ids = (c.enrolledStudents ?? []).map((sId: any) => sId.toString());
    courseStudentIds[c._id.toString()] = ids;
    ids.forEach((sid: string) => {
      if (!studentCourseMap[sid]) studentCourseMap[sid] = new Set();
      studentCourseMap[sid].add(c._id.toString());
    });
  });

  const studentIds = Object.keys(studentCourseMap);
  if (studentIds.length === 0) {
    res.status(200).json({ success: true, message: 'Student performance fetched.', data: [] });
    return;
  }

  // ── Attendance %, scoped to this lecturer's courses ──
  const attendanceRecords = await Attendance.find({ course: { $in: courseIds } }).select('records');
  const attendanceTally: Record<string, { total: number; present: number }> = {};
  attendanceRecords.forEach((rec: any) => {
    rec.records.forEach((r: any) => {
      const sid = r.student.toString();
      if (!studentCourseMap[sid]) return;
      if (!attendanceTally[sid]) attendanceTally[sid] = { total: 0, present: 0 };
      attendanceTally[sid].total += 1;
      if (r.status === AttendanceStatus.PRESENT) attendanceTally[sid].present += 1;
    });
  });

  // ── Assignment completion %, scoped to this lecturer's courses ──
  const assignments = await Assignment.find({ lecturer: lecturer._id, school: req.user?.school })
    .select('course submissions');

  const assignmentTotalByStudent: Record<string, number> = {};
  const assignmentDoneByStudent: Record<string, number> = {};

  assignments.forEach((a: any) => {
    const courseId = a.course.toString();
    (courseStudentIds[courseId] ?? []).forEach((sid) => {
      assignmentTotalByStudent[sid] = (assignmentTotalByStudent[sid] ?? 0) + 1;
    });
    a.submissions.forEach((s: any) => {
      const sid = s.student.toString();
      if (!studentCourseMap[sid]) return;
      assignmentDoneByStudent[sid] = (assignmentDoneByStudent[sid] ?? 0) + 1;
    });
  });

  // ── Trend: latest published session vs previous, scoped to this lecturer's courses ──
  const results = await Result.find({ course: { $in: courseIds }, isPublished: true })
    .select('student session gradePoint course')
    .populate('course', 'creditUnits');

  const bySessionByStudent: Record<string, Record<string, { points: number; credits: number }>> = {};
  results.forEach((r: any) => {
    const sid = r.student.toString();
    if (!studentCourseMap[sid]) return;
    if (!bySessionByStudent[sid]) bySessionByStudent[sid] = {};
    if (!bySessionByStudent[sid][r.session]) bySessionByStudent[sid][r.session] = { points: 0, credits: 0 };
    const credits = r.course?.creditUnits ?? 0;
    bySessionByStudent[sid][r.session].points += r.gradePoint * credits;
    bySessionByStudent[sid][r.session].credits += credits;
  });

  const getTrend = (sid: string): 'up' | 'down' | 'stable' | null => {
    const sessions = bySessionByStudent[sid];
    if (!sessions) return null;
    const keys = Object.keys(sessions).sort();
    if (keys.length < 2) return null;
    const latest = sessions[keys[keys.length - 1]];
    const previous = sessions[keys[keys.length - 2]];
    const latestGpa = latest.credits > 0 ? latest.points / latest.credits : 0;
    const previousGpa = previous.credits > 0 ? previous.points / previous.credits : 0;
    const diff = latestGpa - previousGpa;
    if (diff > 0.2) return 'up';
    if (diff < -0.2) return 'down';
    return 'stable';
  };

  // ── Students: read cached cgpa, build final rows ──
  const students = await Student.find({ _id: { $in: studentIds } })
    .populate('user', 'firstName lastName')
    .select('user matricNumber cgpa');

  const rows = students.map((s: any) => {
    const sid = s._id.toString();
    const att = attendanceTally[sid];
    const attendanceRate = att && att.total > 0 ? Math.round((att.present / att.total) * 100) : null;

    const totalAssignments = assignmentTotalByStudent[sid] ?? 0;
    const doneAssignments = assignmentDoneByStudent[sid] ?? 0;
    const assignmentRate = totalAssignments > 0 ? Math.round((doneAssignments / totalAssignments) * 100) : null;

    const cgpa = s.cgpa ?? 0;

    const gpaRisk: RiskLevel = cgpa < 2.4 ? 'high' : cgpa < 3.5 ? 'medium' : 'low';
    const attendanceRisk: RiskLevel =
      attendanceRate === null ? 'low' : attendanceRate < 60 ? 'high' : attendanceRate < 75 ? 'medium' : 'low';
    const assignmentRisk: RiskLevel =
      assignmentRate === null ? 'low' : assignmentRate < 50 ? 'high' : assignmentRate < 80 ? 'medium' : 'low';

    const risk = [gpaRisk, attendanceRisk, assignmentRisk].reduce((worst, r) =>
      riskRank(r) > riskRank(worst) ? r : worst
    );

    return {
      studentId: sid,
      name: `${s.user?.firstName ?? ''} ${s.user?.lastName ?? ''}`.trim(),
      matric: s.matricNumber,
      cgpa,
      attendanceRate,
      assignmentRate,
      trend: getTrend(sid),
      risk,
    };
  });

  res.status(200).json({ success: true, message: 'Student performance fetched.', data: rows });
};
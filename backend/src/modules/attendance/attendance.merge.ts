import Attendance from './attendance.model';
import { AttendanceStatus, Semester } from '../../types';
import { getLagosDayRange } from '../../utils/helpers';

// One attendance record per course per (Lagos) day. Every way of taking
// attendance — a geofenced session ending, the manual form, the class photo —
// writes into that single record through mergeIntoDayRecord() below.
//
// The rule is "present wins": a write can add presents but never turns a
// student who is already present (or late) back into absent.

export type AttendanceMethod = 'facial_recognition' | 'manual';

export interface MergeEntry {
  student: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
}

export interface PlannedChange {
  student: string;
  status: AttendanceStatus;
  method: AttendanceMethod;
  isNew: boolean; // true = student has no row in the record yet
}

const rank = (status: AttendanceStatus): number =>
  status === AttendanceStatus.PRESENT ? 2 : status === AttendanceStatus.LATE ? 1 : 0;

// Pure decision logic (no database) — which rows of an existing record change.
// An entry only wins if it ranks higher than what is already stored.
export const planMerge = (
  current: { student: string; status: AttendanceStatus }[],
  entries: MergeEntry[]
): PlannedChange[] => {
  const currentByStudent = new Map<string, AttendanceStatus>();
  current.forEach((r) => currentByStudent.set(r.student, r.status));

  // If the same student appears twice in one write, the higher status wins.
  const best = new Map<string, MergeEntry>();
  for (const e of entries) {
    const prev = best.get(e.student);
    if (!prev || rank(e.status) > rank(prev.status)) best.set(e.student, e);
  }

  const changes: PlannedChange[] = [];
  for (const e of best.values()) {
    if (e.status === AttendanceStatus.ABSENT) continue; // absent never downgrades
    const existing = currentByStudent.get(e.student);
    if (existing === undefined) {
      changes.push({ student: e.student, status: e.status, method: e.method, isNew: true });
    } else if (rank(e.status) > rank(existing)) {
      changes.push({ student: e.student, status: e.status, method: e.method, isNew: false });
    }
  }
  return changes;
};

interface MergeParams {
  course: string;
  school: string;
  session: string;
  semester: Semester;
  markedBy: string;
  roster: string[];        // every enrolled student id
  entries: MergeEntry[];   // the statuses this write wants to record
  defaultMethod: AttendanceMethod;
  date?: Date;             // which day's record to use (defaults to now)
}

export const mergeIntoDayRecord = async (p: MergeParams) => {
  const when = p.date ?? new Date();
  const { start, end } = getLagosDayRange(when);

  const existing = await Attendance.findOne({
    course: p.course,
    school: p.school,
    date: { $gte: start, $lt: end },
  });

  // No record for this day yet → create it with a row for every enrolled student.
  if (!existing) {
    const best = new Map<string, MergeEntry>();
    for (const e of p.entries) {
      const prev = best.get(e.student);
      if (!prev || rank(e.status) > rank(prev.status)) best.set(e.student, e);
    }

    const records = p.roster.map((id) => {
      const entry = best.get(id);
      const status = entry?.status ?? AttendanceStatus.ABSENT;
      return {
        student: id,
        status,
        markedAt: status !== AttendanceStatus.ABSENT ? new Date() : undefined,
        method: entry?.method ?? p.defaultMethod,
      };
    });

    const doc = new Attendance({
      course: p.course,
      school: p.school,
      session: p.session,
      semester: p.semester,
      date: when,
      records,
      markedBy: p.markedBy,
    } as any);
    await doc.save();
    return { doc, created: true };
  }

  // A record already exists → only add what is new or higher-ranked.
  const rows = existing.records as any[];
  const changes = planMerge(
    rows.map((r) => ({ student: r.student.toString(), status: r.status as AttendanceStatus })),
    p.entries
  );

  if (changes.length > 0) {
    const rowByStudent = new Map<string, any>();
    rows.forEach((r) => rowByStudent.set(r.student.toString(), r));

    for (const c of changes) {
      if (c.isNew) {
        existing.records.push({
          student: c.student,
          status: c.status,
          markedAt: new Date(),
          method: c.method,
        } as any);
      } else {
        const row = rowByStudent.get(c.student);
        row.status = c.status;
        row.markedAt = new Date();
        row.method = c.method;
      }
    }
    await existing.save();
  }

  return { doc: existing, created: false };
};
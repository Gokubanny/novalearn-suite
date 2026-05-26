import api from '../lib/api';

export interface ScheduleEntry {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  venue: string;
}

export const timetableService = {
  // Get all school courses (with their schedule arrays)
  getCourses: (params?: { department?: string; level?: number; semester?: string }) =>
    api.get('/api/courses/all', { params }),

  // Replace the full schedule array for a course
  updateSchedule: (courseId: string, schedule: ScheduleEntry[]) =>
    api.patch(`/api/courses/${courseId}/schedule`, { schedule }),
};
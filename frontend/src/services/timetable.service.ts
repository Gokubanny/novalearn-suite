import api from '../lib/api';

export interface ScheduleEntry {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  venue: string;
  classType: 'physical' | 'online';
  zoomLink?: string;
}

export const timetableService = {
  getCourses: (params?: { department?: string; level?: number; semester?: string }) =>
    api.get('/api/courses/all', { params }),

  updateSchedule: (courseId: string, schedule: ScheduleEntry[]) =>
    api.patch(`/api/courses/${courseId}/schedule`, { schedule }),
};
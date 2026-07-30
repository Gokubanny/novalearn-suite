import api from '../lib/api';

export const attendanceService = {
  startSession: (
    courseId: string,
    data: { latitude: number; longitude: number; durationMinutes: number }
  ) => api.post(`/api/attendance/sessions/courses/${courseId}/start`, data),

  endSession: (sessionId: string) =>
    api.patch(`/api/attendance/sessions/${sessionId}/end`),

  getActiveSession: (courseId: string) =>
    api.get(`/api/attendance/sessions/courses/${courseId}/active`),

  getSessionResults: (sessionId: string) =>
    api.get(`/api/attendance/sessions/${sessionId}/results`),

  submitSelfie: (
    sessionId: string,
    file: File,
    latitude: number,
    longitude: number
  ) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('latitude', String(latitude));
    formData.append('longitude', String(longitude));
    return api.post(`/api/attendance/sessions/${sessionId}/selfie`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // Backend retries the face service up to ~180s worst-case (cold start).
      // This gives it room to finish rather than timing out first.
      timeout: 200000,
    });
  },

  markAttendanceManual: (courseId: string, records: any[]) =>
    api.post(`/api/attendance/courses/${courseId}/manual`, { records }),

  markAttendanceFacial: (courseId: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/api/attendance/courses/${courseId}/facial`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getCourseAttendance: (courseId: string, params?: any) =>
    api.get(`/api/attendance/courses/${courseId}`, { params }),

  getStudentAttendanceSummary: (courseId: string) =>
    api.get(`/api/attendance/courses/${courseId}/my-summary`),

  registerFace: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/api/attendance/register-face', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export async function getStudentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () =>
        reject(
          new Error('Could not get your location. Please enable location access.')
        )
    );
  });
}
import api from '../lib/api';

export const assignmentService = {
  createAssignment: (data: any, files?: File[]) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    if (files) files.forEach((file) => formData.append('attachments', file));
    return api.post('/api/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getLecturerAssignments: () => api.get('/api/assignments/my-assignments'),
  getStudentAssignments: () => api.get('/api/assignments/student-assignments'),
  submitAssignment: (assignmentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  gradeSubmission: (
    assignmentId: string,
    studentId: string,
    score: number,
    feedback: string
  ) =>
    api.patch(`/api/assignments/${assignmentId}/grade/${studentId}`, {
      score,
      feedback,
    }),
};

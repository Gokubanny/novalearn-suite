import api from '../lib/api';

export const assignmentService = {
  // ── Lecturer ────────────────────────────────────────────────────────────────

  // Fixed: backend expects courseId (not course) and totalMarks (not maxScore)
  createAssignment: (
    data: { courseId: string; title: string; description: string; dueDate: string; totalMarks: number },
    files?: File[]
  ) => {
    const formData = new FormData();
    formData.append('courseId',    data.courseId);
    formData.append('title',       data.title);
    formData.append('description', data.description);
    formData.append('dueDate',     data.dueDate);
    formData.append('totalMarks',  String(data.totalMarks ?? 100));
    if (files) files.forEach(f => formData.append('attachments', f));
    return api.post('/api/assignments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getLecturerAssignments: () =>
    api.get('/api/assignments/my-assignments'),

  getAssignmentSubmissions: (assignmentId: string) =>
    api.get(`/api/assignments/${assignmentId}/submissions`),

  gradeSubmission: (assignmentId: string, studentId: string, score: number, feedback: string) =>
    api.patch(`/api/assignments/${assignmentId}/grade/${studentId}`, { score, feedback }),

  // ── Student ─────────────────────────────────────────────────────────────────

  getStudentAssignments: () =>
    api.get('/api/assignments/student-assignments'),

  submitAssignment: (assignmentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
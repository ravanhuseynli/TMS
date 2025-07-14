import axios from 'axios';


const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

console.log('API Base URL:', API_BASE_URL);


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});


api.interceptors.request.use(
  (config) => {

    const adminToken = localStorage.getItem('adminToken');
    const teacherToken = localStorage.getItem('teacherToken');
    const studentToken = localStorage.getItem('studentToken');
    const generalToken = localStorage.getItem('token');
    
    const token = adminToken || teacherToken || studentToken || generalToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token:', !!token);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.message);
    if (error.response?.status === 401) {
      
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('teacherToken');
      localStorage.removeItem('studentToken');
      localStorage.removeItem('user');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('teacherUser');
      localStorage.removeItem('studentUser');
      

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Admin authentication
  adminSignup: (userData) => api.post('/admins/signup', userData),
  adminLogin: (email, password) => api.post('/admins/login', { email, password }),
  
  // Teacher authentication
  teacherLogin: (email, password) => api.post('/teachers/login', { email, password }),
  
  // Student authentication
  studentLogin: (email, password) => api.post('/students/login', { email, password }),
  

  signup: (userData) => api.post('/signup', userData),
  login: (email, password) => api.post('/login', { email, password }),
};

// Admin API
export const adminAPI = {
  // Admin management
  getAllAdmins: () => api.get('/admins'),
  getAdminProfile: (id) => api.get(`/admins/${id}`),
  updateAdmin: (data) => api.patch('/admins/updateAdmin', data),
  updateMyPassword: (passwordData) => api.patch('/admins/updateMyPassword', passwordData),

  // Teacher management
  signupTeacher: (teacherData) => api.post('/teachers/signup-teacher', teacherData),
  getAllTeachers: () => api.get('/teachers'),
  getTeacher: (teacherId) => api.get(`/teachers/${teacherId}`),
  updateTeacher: (teacherId, teacherData) => api.patch(`/teachers/${teacherId}/update/admin`, teacherData),

  // Student management
  signupStudent: (studentData) => api.post('/students/signup-student', studentData),
  getAllStudents: () => api.get('/students'),
  getStudent: (studentId) => api.get(`/students/${studentId}`),
  updateStudent: (studentId, studentData) => api.patch(`/students/${studentId}/update/admin`, studentData),

  // Academic Years management
  getAcademicYears: () => api.get('/academic-years'),
  createAcademicYear: (data) => api.post('/academic-years', data),
  getAcademicYear: (id) => api.get(`/academic-years/${id}`),
  updateAcademicYear: (id, data) => api.patch(`/academic-years/${id}`, data),
  deleteAcademicYear: (id) => api.delete(`/academic-years/${id}`),

  // Academic Terms management
  createAcademicTerm: (data) => api.post('/academic-terms', data),
  getAcademicTerms: () => api.get('/academic-terms'),
  getAcademicTerm: (id) => api.get(`/academic-terms/${id}`),
  updateAcademicTerm: (id, data) => api.patch(`/academic-terms/${id}`, data),
  deleteAcademicTerm: (id) => api.delete(`/academic-terms/${id}`),

  // Class Levels management
  createClassLevel: (data) => api.post('/class-levels', data),
  getClassLevels: () => api.get('/class-levels'),
  getClassLevel: (id) => api.get(`/class-levels/${id}`),
  updateClassLevel: (id, data) => api.patch(`/class-levels/${id}`, data),
  deleteClassLevel: (id) => api.delete(`/class-levels/${id}`),

  // Programs management
  createProgram: (data) => api.post('/programs', data),
  getPrograms: () => api.get('/programs'),
  getProgram: (id) => api.get(`/programs/${id}`),
  updateProgram: (id, data) => api.patch(`/programs/${id}`, data),
  deleteProgram: (id) => api.delete(`/programs/${id}`),

  // Subjects management (for admin)
  createSubject: (data) => api.post('/subjects', data),
  getSubjects: () => api.get('/subjects'),
  getSubject: (id) => api.get(`/subjects/${id}`),
  updateSubject: (id, data) => api.patch(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),

  // Year Groups management
  createYearGroup: (data) => api.post('/year-groups', data),
  getYearGroups: () => api.get('/year-groups'),
  getYearGroup: (id) => api.get(`/year-groups/${id}`),
  updateYearGroup: (id, data) => api.patch(`/year-groups/${id}`, data),
  deleteYearGroup: (id) => api.delete(`/year-groups/${id}`),

  // Statistics for admin dashboard
  getStatistics: () => api.get('/admin/statistics'),
  
  // Exam Results management
  toggleExamResultPublish: (id) => api.patch(`/exam-results/${id}/admin-toggle-publish`),
  
  // Get all exams for admin
  getExams: () => api.get('/exams'),
};

// Teacher API
export const teacherAPI = {
  // Profile management
  getProfile: () => api.get('/teachers/profile'),
  updateProfile: (teacherId, data) => api.patch(`/teachers/${teacherId}/update`, data),
  updateMyPassword: (passwordData) => api.patch('/teachers/updateMyPassword', passwordData),

  // Exams management
  createExam: (examData) => api.post('/exams', examData),
  getExams: () => api.get('/exams'),
  getExam: (id) => api.get(`/exams/${id}`),
  updateExam: (id, examData) => api.patch(`/exams/${id}`, examData),

  // Questions management
  createQuestion: (examId, questionData) => api.post(`/questions/${examId}`, questionData),
  getQuestions: () => api.get('/questions'),
  getQuestion: (id) => api.get(`/questions/${id}`),
  updateQuestion: (id, questionData) => api.patch(`/questions/${id}`, questionData),

  // Subjects management (Teacher can create subjects)
  createSubject: (programId, subjectData) => api.post(`/subjects/${programId}`, subjectData),
  getSubjects: () => api.get('/subjects'),
  getSubject: (id) => api.get(`/subjects/${id}`),
  updateSubject: (id, subjectData) => api.patch(`/subjects/${id}`, subjectData),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

// Student API
export const studentAPI = {
  // Profile management
  getProfile: () => api.get('/students/profile'),
  updateProfile: (studentId, data) => api.patch(`/students/${studentId}/update`, data),
  updateMyPassword: (passwordData) => api.patch('/students/updateMyPassword', passwordData),

  // Exams
  writeExam: (examId, examData) => api.post(`/students/exam/${examId}/write`, examData),

  // Exam Results
  getExamResults: () => api.get('/exam-results'),
  checkExamResult: (id) => api.get(`/exam-results/${id}/checking`),
};

// General APIs (accessible by multiple roles)
export const generalAPI = {
  // Get all exams (for students to see available exams)
  getAllExams: () => api.get('/exams'),
  
  // Get specific exam details
  getExam: (examId) => api.get(`/exams/${examId}`),
  
  // Get questions for a specific exam
  getExamQuestions: (examId) => api.get(`/questions/exam/${examId}`),
  // Academic Terms (GET operations are open to all)
  getAcademicTerms: () => api.get('/academic-terms'),
  getAcademicTerm: (id) => api.get(`/academic-terms/${id}`),

  // Academic Years (some GET operations)
  getAcademicYear: (id) => api.get(`/academic-years/${id}`),

  // Class Levels
  getClassLevel: (id) => api.get(`/class-levels/${id}`),

  // Programs
  getProgram: (id) => api.get(`/programs/${id}`),

  // Subjects
  getSubject: (id) => api.get(`/subjects/${id}`),

  // Year Groups
  getYearGroup: (id) => api.get(`/year-groups/${id}`),

  // Exams
  getExam: (id) => api.get(`/exams/${id}`),

  // Questions
  getQuestion: (id) => api.get(`/questions/${id}`),
};

export default api; 
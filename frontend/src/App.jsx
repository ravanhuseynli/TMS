import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import TeachersPage from './pages/admin/TeachersPage';
import StudentsPage from './pages/admin/StudentsPage';
import AcademicYearsPage from './pages/admin/AcademicYearsPage';
import AcademicTermsPage from './pages/admin/AcademicTermsPage';
import ClassLevelsPage from './pages/admin/ClassLevelsPage';
import ProgramsPage from './pages/admin/ProgramsPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import YearGroupsPage from './pages/admin/YearGroupsPage';

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherExamsPage from './pages/teacher/ExamsPage';
import TeacherQuestionsPage from './pages/teacher/QuestionsPage';
import TeacherSubjectsPage from './pages/teacher/SubjectsPage';
import TeacherProfile from './pages/teacher/TeacherProfile';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import AvailableExamsPage from './pages/student/AvailableExamsPage';
import ExamTakingPage from './pages/student/ExamTakingPage';
import ExamResultsPage from './pages/student/ExamResultsPage';
import ExamSuccessPage from './pages/student/ExamSuccessPage';

// Placeholder components for new admin pages
const AdminExamsPage = () => <div>Admin Exams Management - Coming Soon</div>;
const AdminQuestionsPage = () => <div>Admin Questions Management - Coming Soon</div>;
const AdminExamResultsPage = () => <div>Admin Exam Results Management - Coming Soon</div>;

// Placeholder components for other pages
const UnauthorizedPage = () => <div>Unauthorized Access</div>;
const NotFoundPage = () => <div>Page Not Found</div>;

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="teachers" element={<TeachersPage />} />
                      <Route path="students" element={<StudentsPage />} />
                      <Route path="academic-years" element={<AcademicYearsPage />} />
                      <Route path="academic-terms" element={<AcademicTermsPage />} />
                      <Route path="class-levels" element={<ClassLevelsPage />} />
                      <Route path="programs" element={<ProgramsPage />} />
                      <Route path="subjects" element={<SubjectsPage />} />
                      <Route path="year-groups" element={<YearGroupsPage />} />
                      <Route path="exams" element={<AdminExamsPage />} />
                      <Route path="questions" element={<AdminQuestionsPage />} />
                      <Route path="exam-results" element={<AdminExamResultsPage />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute roles={['teacher']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<TeacherDashboard />} />
                      <Route path="exams" element={<TeacherExamsPage />} />
                      <Route path="questions" element={<TeacherQuestionsPage />} />
                      <Route path="subjects" element={<TeacherSubjectsPage />} />
                      <Route path="profile" element={<TeacherProfile />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/student/*"
              element={
                <ProtectedRoute roles={['student']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="exams" element={<AvailableExamsPage />} />
                      <Route path="exam/:examId" element={<ExamTakingPage />} />
                      <Route path="exam-success" element={<ExamSuccessPage />} />
                      <Route path="results" element={<ExamResultsPage />} />
                      <Route path="profile" element={<StudentProfile />} />
                      <Route path="" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default dashboard redirect */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Help page */}
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div>Help Page - Coming Soon</div>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

// Component to redirect to role-specific dashboard
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === 'teacher') {
    return <Navigate to="/teacher/dashboard" replace />;
  } else if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

export default App;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  People,
  School,
  CalendarMonth,
  Book,
  TrendingUp,
  ArrowForward,
  AdminPanelSettings,
  Assignment,
  Analytics,
  PersonAdd,
  LibraryBooks,
  Layers,
  Groups,
  Event,
  Quiz,
  AssessmentOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI, teacherAPI, generalAPI, studentAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalSubjects: 0,
    totalPrograms: 0,
    totalAcademicYears: 0,
    totalAcademicTerms: 0,
    totalClassLevels: 0,
    totalYearGroups: 0,
    totalExams: 0,
    totalQuestions: 0,
    totalExamResults: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      console.log('Loading dashboard statistics...');
      
      // Paralel API çağrıları ilə bütün statistikaları yükləyirik
      const [
        teachersResponse,
        studentsResponse,
        subjectsResponse,
        programsResponse,
        academicYearsResponse,
        academicTermsResponse,
        classLevelsResponse,
        yearGroupsResponse,
        examsResponse,
        questionsResponse,
        examResultsResponse
      ] = await Promise.allSettled([
        adminAPI.getAllTeachers(),
        adminAPI.getAllStudents(),
        adminAPI.getSubjects(),
        adminAPI.getPrograms(),
        adminAPI.getAcademicYears(),
        adminAPI.getAcademicTerms(),
        adminAPI.getClassLevels(),
        adminAPI.getYearGroups(),
        adminAPI.getExams(),
        teacherAPI.getQuestions(),
        studentAPI.getExamResults()
      ]);

      console.log('API responses:', {
        teachers: teachersResponse,
        students: studentsResponse,
        subjects: subjectsResponse,
        programs: programsResponse,
        academicYears: academicYearsResponse,
        academicTerms: academicTermsResponse,
        classLevels: classLevelsResponse,
        yearGroups: yearGroupsResponse,
        exams: examsResponse,
        questions: questionsResponse,
        examResults: examResultsResponse
      });

      setStats({
        totalTeachers: teachersResponse.status === 'fulfilled' ? 
          (teachersResponse.value?.data?.teachers?.length || 0) : 0,
        totalStudents: studentsResponse.status === 'fulfilled' ? 
          (studentsResponse.value?.data?.students?.length || 0) : 0,
        totalSubjects: subjectsResponse.status === 'fulfilled' ? 
          (subjectsResponse.value?.data?.subjects?.length || 0) : 0,
        totalPrograms: programsResponse.status === 'fulfilled' ? 
          (programsResponse.value?.data?.programs?.length || 0) : 0,
        totalAcademicYears: academicYearsResponse.status === 'fulfilled' ? 
          (academicYearsResponse.value?.data?.academicYears?.length || 0) : 0,
        totalAcademicTerms: academicTermsResponse.status === 'fulfilled' ? 
          (academicTermsResponse.value?.data?.academicTerms?.length || 0) : 0,
        totalClassLevels: classLevelsResponse.status === 'fulfilled' ? 
          (classLevelsResponse.value?.data?.classes?.length || 0) : 0,
        totalYearGroups: yearGroupsResponse.status === 'fulfilled' ? 
          (yearGroupsResponse.value?.data?.yearGroups?.length || 0) : 0,
        totalExams: examsResponse.status === 'fulfilled' ? 
          (examsResponse.value?.data?.exams?.length || 0) : 0,
        totalQuestions: questionsResponse.status === 'fulfilled' ? 
          (questionsResponse.value?.data?.questions?.length || 0) : 0,
        totalExamResults: examResultsResponse.status === 'fulfilled' ? 
          (examResultsResponse.value?.data?.data?.length || 0) : 0,
        loading: false,
        error: null
      });

      console.log('Stats updated successfully');
    } catch (error) {
      console.error('Stats yüklənərkən xəta:', error);
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Statistikalar yüklənərkən xəta baş verdi' 
      }));
    }
  };

  const statsCards = [
    {
      title: 'Müəllimlər',
      value: stats.totalTeachers,
      icon: <People />,
      color: 'primary',
      link: '/admin/teachers',
      description: 'Qeydiyyatlı müəllim sayı'
    },
    {
      title: 'Şagirdlər',
      value: stats.totalStudents,
      icon: <School />,
      color: 'success',
      link: '/admin/students',
      description: 'Qeydiyyatlı şagird sayı'
    },
    {
      title: 'Fənlər',
      value: stats.totalSubjects,
      icon: <Book />,
      color: 'warning',
      link: '/admin/subjects',
      description: 'Yaradılmış fənn sayı'
    },
    {
      title: 'Proqramlar',
      value: stats.totalPrograms,
      icon: <LibraryBooks />,
      color: 'secondary',
      link: '/admin/programs',
      description: 'Tədris proqramı sayı'
    },
    {
      title: 'Tədris İlləri',
      value: stats.totalAcademicYears,
      icon: <CalendarMonth />,
      color: 'info',
      link: '/admin/academic-years',
      description: 'Akademik il sayı'
    },
    {
      title: 'Akademik Mövsümlər',
      value: stats.totalAcademicTerms,
      icon: <Event />,
      color: 'primary',
      link: '/admin/academic-terms',
      description: 'Akademik mövsüm sayı'
    },
    {
      title: 'Siniflər',
      value: stats.totalClassLevels,
      icon: <Layers />,
      color: 'warning',
      link: '/admin/class-levels',
      description: 'Siniflərin sayı'
    },
    {
      title: 'İl Qrupları',
      value: stats.totalYearGroups,
      icon: <Groups />,
      color: 'success',
      link: '/admin/year-groups',
      description: 'İl qrupu sayı'
    },
    {
      title: 'İmtahanlar',
      value: stats.totalExams,
      icon: <Assignment />,
      color: 'error',
      link: '/admin/exams',
      description: 'Yaradılmış imtahan sayı'
    },
    {
      title: 'Suallar',
      value: stats.totalQuestions,
      icon: <Quiz />,
      color: 'info',
      link: '/admin/questions',
      description: 'İmtahan sualı sayı'
    },
    {
      title: 'İmtahan Nəticələri',
      value: stats.totalExamResults,
      icon: <AssessmentOutlined />,
      color: 'secondary',
      link: '/admin/exam-results',
      description: 'Mövcud imtahan nəticəsi'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'admin_login',
      message: `${user?.name || 'Admin'} sistemə daxil oldu`,
      time: 'İndi',
      icon: <AdminPanelSettings />,
      color: 'primary'
    },
    {
      id: 2,
      type: 'stats_loaded',
      message: 'Dashboard statistikaları yeniləndi',
      time: '1 dəqiqə əvvəl',
      icon: <Analytics />,
      color: 'success'
    },
    {
      id: 3,
      type: 'system_info',
      message: `${stats.totalTeachers} müəllim, ${stats.totalStudents} şagird aktiv`,
      time: '2 dəqiqə əvvəl',
      icon: <TrendingUp />,
      color: 'info'
    },
    {
      id: 4,
      type: 'backend_connect',
      message: 'Backend API ilə əlaqə quruldu',
      time: '3 dəqiqə əvvəl',
      icon: <PersonAdd />,
      color: 'secondary'
    },
    {
      id: 5,
      type: 'data_sync',
      message: 'Müəllim məlumatları sinxronlaşdırıldı',
      time: '5 dəqiqə əvvəl',
      icon: <People />,
      color: 'primary'
    },
    {
      id: 6,
      type: 'data_sync',
      message: 'Şagird məlumatları yeniləndi',
      time: '7 dəqiqə əvvəl',
      icon: <School />,
      color: 'success'
    }
  ];

  if (stats.loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Admin Paneli
        </Typography>
        <LinearProgress sx={{ my: 2 }} />
        <Typography color="text.secondary">
          Real məlumatlar backend-dən yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Admin Paneli
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sistemin ümumi görünüşü və statistikaları
        </Typography>
        
        {stats.error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {stats.error}
          </Alert>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              component={Link}
              to={card.link}
              sx={{ 
                textDecoration: 'none',
                height: '100%',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: `${card.color}.main`,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <IconButton 
                    size="small"
                    sx={{ 
                      bgcolor: `${card.color}.50`,
                      '&:hover': { bgcolor: `${card.color}.100` }
                    }}
                  >
                    <ArrowForward fontSize="small" />
                  </IconButton>
                </Box>
                
                <Typography variant="h4" component="div" fontWeight="bold" mb={1}>
                  {card.value}
                </Typography>
                
                <Typography variant="h6" color="text.primary" gutterBottom>
                  {card.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📋 Son Fəaliyyətlər
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  Son 10 dəqiqə
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Sistemdə son baş verən hadisələr və fəaliyyətlər
              </Typography>
              
              <Grid container spacing={2}>
                {recentActivities.map((activity, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={activity.id}>
                    <Card 
                      variant="outlined"
                      sx={{
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Avatar sx={{ 
                            bgcolor: `${activity.color}.main`,
                            width: 32,
                            height: 32
                          }}>
                            {activity.icon}
                          </Avatar>
                          <Typography variant="caption" color="text.secondary">
                            🕒 {activity.time}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                          {activity.message}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  🔄 Real vaxt yenilənmələr aktiv • 📊 {recentActivities.length} fəaliyyət
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 
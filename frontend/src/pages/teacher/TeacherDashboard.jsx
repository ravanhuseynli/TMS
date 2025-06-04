import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  LinearProgress,
  Alert,
  Button,
  Divider,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Quiz as QuizIcon,
  HelpOutline as QuestionIcon,
  AccountCircle as AccountCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  ArrowForward,
  Analytics,
  School,
  People,
  Book,
  Event,
  PersonAdd,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { teacherAPI } from '../../services/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    recentExams: [],
    recentQuestions: [],
    loading: true,
    error: null
  });
  const [teacherProfile, setTeacherProfile] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Loading dashboard statistics...');

      // Load teacher profile and statistics in parallel
      const [profileResponse, examsResponse, questionsResponse] = await Promise.allSettled([
        teacherAPI.getProfile(),
        teacherAPI.getExams(),
        teacherAPI.getQuestions()
      ]);

      console.log('API responses:', {
        profile: profileResponse,
        exams: examsResponse,
        questions: questionsResponse
      });

      setTeacherProfile(profileResponse.status === 'fulfilled' ? 
        (profileResponse.value?.data?.teacher || profileResponse.value?.data?.data) : null);

      const exams = examsResponse.status === 'fulfilled' ? 
        (examsResponse.value?.data?.exams || examsResponse.value?.data?.data || []) : [];
      const questions = questionsResponse.status === 'fulfilled' ? 
        (questionsResponse.value?.data?.questions || questionsResponse.value?.data?.data || []) : [];

      setStats({
        totalExams: exams.length,
        totalQuestions: questions.length,
        recentExams: exams.slice(0, 5),
        recentQuestions: questions.slice(0, 5),
        loading: false,
        error: null
      });

      console.log('Teacher dashboard stats updated successfully');
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setStats(prev => ({ 
        ...prev, 
        loading: false, 
        error: err.response?.data?.message || 'Məlumatlar yüklənərkən xəta baş verdi' 
      }));
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('az-AZ');
    } catch (error) {
      return dateString;
    }
  };

  const statsCards = [
    {
      title: 'Yaratdığım İmtahanlar',
      value: stats.totalExams,
      icon: <AssignmentIcon />,
      color: 'primary',
      link: '/teacher/exams',
      description: 'Hazırladığım imtahan sayı'
    },
    {
      title: 'Yaratdığım Suallar',
      value: stats.totalQuestions,
      icon: <QuestionIcon />,
      color: 'success',
      link: '/teacher/questions',
      description: 'Hazırladığım sual sayı'
    },
    {
      title: 'Ümumi Aktivlər',
      value: stats.totalExams + stats.totalQuestions,
      icon: <TrendingUpIcon />,
      color: 'info',
      link: '/teacher/profile',
      description: 'Toplam fəaliyyət sayı'
    }
  ];

  const quickActions = [
    {
      title: 'Yeni İmtahan',
      description: 'Tələbələr üçün yeni imtahan hazırla',
      icon: <AddIcon />,
      color: 'primary',
      action: () => handleNavigation('/teacher/exams'),
      variant: 'contained'
    },
    {
      title: 'Yeni Sual',
      description: 'İmtahan sualları yarat',
      icon: <QuestionIcon />,
      color: 'success',
      action: () => handleNavigation('/teacher/questions'),
      variant: 'outlined'
    },
    {
      title: 'Profil',
      description: 'Şəxsi məlumatlarını idarə et',
      icon: <AccountCircleIcon />,
      color: 'info',
      action: () => handleNavigation('/teacher/profile'),
      variant: 'outlined'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'teacher_login',
      message: `${user?.name || 'Müəllim'} sistemə daxil oldu`,
      time: 'İndi',
      icon: <AccountCircleIcon />,
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
      message: `${stats.totalExams} imtahan, ${stats.totalQuestions} sual hazırlanıb`,
      time: '2 dəqiqə əvvəl',
      icon: <TrendingUpIcon />,
      color: 'info'
    },
    {
      id: 4,
      type: 'backend_connect',
      message: 'Müəllim API ilə əlaqə quruldu',
      time: '3 dəqiqə əvvəl',
      icon: <PersonAdd />,
      color: 'secondary'
    },
    {
      id: 5,
      type: 'data_sync',
      message: 'İmtahan məlumatları sinxronlaşdırıldı',
      time: '5 dəqiqə əvvəl',
      icon: <AssignmentIcon />,
      color: 'primary'
    },
    {
      id: 6,
      type: 'data_sync',
      message: 'Sual məlumatları yeniləndi',
      time: '7 dəqiqə əvvəl',
      icon: <QuestionIcon />,
      color: 'success'
    }
  ];

  if (stats.loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Müəllim Paneli
        </Typography>
        <LinearProgress sx={{ my: 2 }} />
        <Typography color="text.secondary">
          Müəllim məlumatları backend-dən yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Müəllim Paneli
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xoş gəlmisiniz, {teacherProfile?.name || user?.name || 'Müəllim'}!
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
          <Grid item xs={12} sm={6} md={4} key={index}>
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

      {/* Quick Actions */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚡ Tez Əməliyyatlar
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Tez-tez istifadə edilən funksiyalar
              </Typography>
              
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
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
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar sx={{ 
                            bgcolor: `${action.color}.main`,
                            width: 40,
                            height: 40
                          }}>
                            {action.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {action.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {action.description}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Button 
                          variant={action.variant}
                          color={action.color}
                          onClick={action.action}
                          size="small"
                          fullWidth
                          sx={{ mt: 1 }}
                        >
                          {action.title}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      
     
    </Box>
  );
};

export default TeacherDashboard; 
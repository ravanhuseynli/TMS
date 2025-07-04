import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Quiz as QuizIcon,
  HelpOutline as QuestionIcon,
  Subject as SubjectIcon,
  AccountCircle as AccountCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../services/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalExams: 0,
    totalQuestions: 0,
    totalSubjects: 0,
    recentExams: [],
    recentQuestions: [],
    recentSubjects: []
  });
  const [teacherProfile, setTeacherProfile] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load teacher profile and statistics in parallel
      const [profileResponse, examsResponse, questionsResponse, subjectsResponse] = await Promise.all([
        teacherAPI.getProfile(),
        teacherAPI.getExams(),
        teacherAPI.getQuestions(),
        teacherAPI.getSubjects()
      ]);

      setTeacherProfile(profileResponse.data?.teacher || profileResponse.data?.data);

      const exams = examsResponse.data?.exams || examsResponse.data?.data || [];
      const questions = questionsResponse.data?.questions || questionsResponse.data?.data || [];
      const subjects = subjectsResponse.data?.subjects || subjectsResponse.data?.data || [];

      setStatistics({
        totalExams: exams.length,
        totalQuestions: questions.length,
        totalSubjects: subjects.length,
        recentExams: exams.slice(0, 5),
        recentQuestions: questions.slice(0, 5),
        recentSubjects: subjects.slice(0, 5)
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.response?.data?.message || 'Məlumatlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={loadDashboardData}
          startIcon={<TrendingUpIcon />}
        >
          Yenidən yüklə
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              Müəllim Paneli
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Xoş gəlmisiniz, {teacherProfile?.name || 'Müəllim'}!
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent="flex-end">
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                <AccountCircleIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Ümumi İmtahanlar
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.totalExams}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Ümumi Suallar
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.totalQuestions}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <QuestionIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Ümumi Fənlər
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.totalSubjects}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <SubjectIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Aktivlər
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.totalExams + statistics.totalQuestions + statistics.totalSubjects}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tez Əməliyyatlar
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleNavigation('/teacher/exams')}
              size="large"
            >
              Yeni İmtahan
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<QuestionIcon />}
              onClick={() => handleNavigation('/teacher/questions')}
              size="large"
            >
              Yeni Sual
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<SubjectIcon />}
              onClick={() => handleNavigation('/teacher/subjects')}
              size="large"
            >
              Yeni Fənn
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<AccountCircleIcon />}
              onClick={() => handleNavigation('/teacher/profile')}
              size="large"
            >
              Profil
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Activities */}
      <Grid container spacing={3}>
        {/* Recent Exams */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Son İmtahanlar
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {statistics.recentExams.length > 0 ? (
                <List>
                  {statistics.recentExams.map((exam, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <AssignmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={exam.name}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {exam.examType} - {exam.duration}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {formatDate(exam.examDate)} - {exam.examTime}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Hələ imtahan yoxdur
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => handleNavigation('/teacher/exams')}
                endIcon={<VisibilityIcon />}
              >
                Hamısını Gör
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recent Questions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Son Suallar
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {statistics.recentQuestions.length > 0 ? (
                <List>
                  {statistics.recentQuestions.map((question, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <QuestionIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={question.question?.substring(0, 50) + '...'}
                        secondary={
                          <Box>
                            <Chip 
                              label={question.correctAnswer || 'A'} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Hələ sual yoxdur
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => handleNavigation('/teacher/questions')}
                endIcon={<VisibilityIcon />}
              >
                Hamısını Gör
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Recent Subjects */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Son Fənlər
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {statistics.recentSubjects.length > 0 ? (
                <List>
                  {statistics.recentSubjects.map((subject, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <SubjectIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={subject.name}
                        secondary={subject.description}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  Hələ fənn yoxdur
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => handleNavigation('/teacher/subjects')}
                endIcon={<VisibilityIcon />}
              >
                Hamısını Gör
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherDashboard; 
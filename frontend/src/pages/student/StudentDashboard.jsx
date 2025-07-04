import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalExams: 0,
    completedExams: 0,
    pendingExams: 0,
    totalResults: 0,
    publishedResults: 0,
    averageScore: 0,
    availableExams: [],
    recentResults: []
  });
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load student profile and exam results in parallel
      const [profileResponse, resultsResponse] = await Promise.all([
        studentAPI.getProfile(),
        studentAPI.getExamResults()
      ]);

      setStudentProfile(profileResponse.data?.student || profileResponse.data?.data);

      const examResults = resultsResponse.data?.examResults || resultsResponse.data?.data || [];
      const publishedResults = examResults.filter(result => result.isPublished);
      const completedExams = examResults.length;
      
      // Calculate average score
      const totalScore = publishedResults.reduce((sum, result) => sum + (result.score || 0), 0);
      const averageScore = publishedResults.length > 0 ? (totalScore / publishedResults.length).toFixed(1) : 0;

      setStatistics({
        totalExams: completedExams,
        completedExams: completedExams,
        pendingExams: 0, // Bu məlumat API-dan gəlmir
        totalResults: examResults.length,
        publishedResults: publishedResults.length,
        averageScore: averageScore,
        availableExams: [], // Bu məlumat ayrıca yüklənməlidir
        recentResults: examResults.slice(0, 5)
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

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    if (score >= 50) return 'primary';
    return 'error';
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
              Tələbə Paneli
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Xoş gəlmisiniz, {studentProfile?.name || 'Tələbə'}!
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
                    Tamamlanmış İmtahanlar
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.completedExams}
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
                    Nəticələr
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.publishedResults}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
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
                    Orta Bal
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.averageScore}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUpIcon />
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
                    Mövcud İmtahanlar
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.pendingExams}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <ScheduleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tez Keçidlər
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<QuizIcon />}
                    onClick={() => handleNavigation('/student/exams')}
                    sx={{ mb: 2 }}
                  >
                    Mövcud İmtahanlar
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleNavigation('/student/results')}
                    sx={{ mb: 2 }}
                  >
                    İmtahan Nəticələri
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountCircleIcon />}
                    onClick={() => handleNavigation('/student/profile')}
                    sx={{ mb: 2 }}
                  >
                    Profil
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profil Məlumatları
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Ad:</strong> {studentProfile?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Email:</strong> {studentProfile?.email || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Tələbə ID:</strong> {studentProfile?.studentId || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Status:</strong> 
                  <Chip 
                    label={studentProfile?.isWithdrawn ? 'Çıxarılmış' : 'Aktiv'} 
                    color={studentProfile?.isWithdrawn ? 'error' : 'success'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Results */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Son İmtahan Nəticələri
              </Typography>
              
              {statistics.recentResults.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Hələ heç bir imtahan nəticəsi yoxdur
                  </Typography>
                </Box>
              ) : (
                <List>
                  {statistics.recentResults.map((result, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <AssignmentIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={result.exam?.name || 'İmtahan'}
                        secondary={`Tarix: ${formatDate(result.createdAt)}`}
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" alignItems="center" gap={1}>
                          {result.isPublished ? (
                            <>
                              <Chip 
                                label={`${result.score || 0}%`}
                                color={getScoreColor(result.score || 0)}
                                size="small"
                              />
                              <Button
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleNavigation('/student/results')}
                              >
                                Bax
                              </Button>
                            </>
                          ) : (
                            <Chip 
                              label="Gözləmədə"
                              color="default"
                              size="small"
                            />
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard; 
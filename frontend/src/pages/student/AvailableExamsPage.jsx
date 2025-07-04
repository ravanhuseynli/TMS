import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { studentAPI, generalAPI } from '../../services/api';

const AvailableExamsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    loadAvailableExams();
  }, []);

  const loadAvailableExams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // API sənədlərində tələbələr üçün spesifik "available exams" endpoint-i yoxdur
      // Ona görə ümumi exams endpoint-indən istifadə edirik
      const response = await generalAPI.getAllExams();
      const examsData = response.data?.exams || response.data?.data || [];
      
      // Yalnız aktivdir və vaxtı gələn imtahanları göstər
      const today = new Date();
      const availableExams = examsData.filter(exam => {
        const examDate = new Date(exam.examDate);
        return examDate >= today;
      });
      
      setExams(availableExams);
      
    } catch (err) {
      console.error('Error loading available exams:', err);
      setError(err.response?.data?.message || 'İmtahanlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (exam) => {
    setSelectedExam(exam);
    setConfirmDialogOpen(true);
  };

  const handleConfirmStartExam = () => {
    if (selectedExam) {
      setConfirmDialogOpen(false);
      navigate(`/student/exam/${selectedExam._id}`);
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setSelectedExam(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('az-AZ');
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('az-AZ', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  const getExamStatus = (exam) => {
    const today = new Date();
    const examDate = new Date(exam.examDate);
    
    if (examDate < today) {
      return { status: 'keçmişdə', color: 'error' };
    } else if (examDate.toDateString() === today.toDateString()) {
      return { status: 'bugün', color: 'warning' };
    } else {
      return { status: 'gələcəkdə', color: 'success' };
    }
  };

  const canTakeExam = (exam) => {
    const today = new Date();
    const examDate = new Date(exam.examDate);
    
    // Yalnız bugün və ya gələcəkdə olan imtahanları vermək olar
    return examDate >= today;
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mövcud İmtahanlar
        </Typography>
        <Typography variant="h6" color="text.secondary">
          İmtahan verə biləcəyiniz imtahanları seçin
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {exams.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Hal-hazırda mövcud imtahan yoxdur
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Yeni imtahanlar əlavə edildikdə burada görünəcək
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {exams.map((exam) => {
            const examStatus = getExamStatus(exam);
            const canTake = canTakeExam(exam);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={exam._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {exam.name}
                      </Typography>
                      <Chip 
                        label={examStatus.status}
                        color={examStatus.color}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {exam.description}
                    </Typography>

                    <List dense>
                      <ListItem disablePadding>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
                              Tarix
                            </Box>
                          }
                          secondary={formatDate(exam.examDate)}
                        />
                      </ListItem>

                      <ListItem disablePadding>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                              Vaxt
                            </Box>
                          }
                          secondary={formatTime(exam.examTime)}
                        />
                      </ListItem>

                      <ListItem disablePadding>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
                              Müddət
                            </Box>
                          }
                          secondary={`${exam.duration} dəqiqə`}
                        />
                      </ListItem>

                      <ListItem disablePadding>
                        <ListItemText
                          primary="Fənn"
                          secondary={exam.subject?.name || 'N/A'}
                        />
                      </ListItem>

                      <ListItem disablePadding>
                        <ListItemText
                          primary="Sinif"
                          secondary={exam.classLevel?.name || 'N/A'}
                        />
                      </ListItem>

                      <ListItem disablePadding>
                        <ListItemText
                          primary="Tip"
                          secondary={exam.examType || 'N/A'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>

                  <Divider />

                  <Box sx={{ p: 2 }}>
                    <Button
                      variant={canTake ? "contained" : "outlined"}
                      fullWidth
                      startIcon={<PlayArrowIcon />}
                      onClick={() => handleStartExam(exam)}
                      disabled={!canTake}
                    >
                      {canTake ? 'İmtahana Başla' : 'İmtahan Bitib'}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <InfoIcon sx={{ mr: 1, color: 'warning.main' }} />
            İmtahan Təsdiqi
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedExam && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedExam.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {selectedExam.description}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Tarix:</strong> {formatDate(selectedExam.examDate)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Vaxt:</strong> {formatTime(selectedExam.examTime)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Müddət:</strong> {selectedExam.duration} dəqiqə
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Fənn:</strong> {selectedExam.subject?.name || 'N/A'}
                </Typography>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Diqqət:</strong> İmtahana başladıqdan sonra müddət bitənə qədər təslim etməlisiniz. 
                  Səhifəni yenidən yükləmək və ya bağlamaq imtahanı təslim etməyə məcbur edəcək.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            İmtina Et
          </Button>
          <Button onClick={handleConfirmStartExam} variant="contained" startIcon={<PlayArrowIcon />}>
            İmtahana Başla
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AvailableExamsPage;

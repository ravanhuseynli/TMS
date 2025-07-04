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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';

const ExamResultsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statistics, setStatistics] = useState({
    totalExams: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passedExams: 0,
    failedExams: 0
  });

  useEffect(() => {
    loadExamResults();
  }, []);

  const loadExamResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentAPI.getExamResults();
      const resultsData = response.data?.examResults || response.data?.data || [];
      
      setResults(resultsData);
      calculateStatistics(resultsData);
      
    } catch (err) {
      console.error('Error loading exam results:', err);
      setError(err.response?.data?.message || 'İmtahan nəticələri yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (resultsData) => {
    const publishedResults = resultsData.filter(result => result.isPublished);
    
    if (publishedResults.length === 0) {
      setStatistics({
        totalExams: resultsData.length,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passedExams: 0,
        failedExams: 0
      });
      return;
    }

    const scores = publishedResults.map(result => result.score || 0);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passedExams = publishedResults.filter(result => (result.score || 0) >= 50).length;
    const failedExams = publishedResults.filter(result => (result.score || 0) < 50).length;

    setStatistics({
      totalExams: resultsData.length,
      averageScore: averageScore.toFixed(1),
      highestScore,
      lowestScore,
      passedExams,
      failedExams
    });
  };

  const handleViewDetails = async (result) => {
    try {
      // Detalı nəticəni yüklə
      const response = await studentAPI.checkExamResult(result._id);
      const detailData = response.data?.examResult || response.data?.data;
      
      setSelectedResult(detailData || result);
      setDetailDialogOpen(true);
      
    } catch (err) {
      console.error('Error loading result details:', err);
      setSelectedResult(result);
      setDetailDialogOpen(true);
    }
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

  const getGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    if (score >= 50) return 'E';
    return 'F';
  };

  const getStatus = (result) => {
    if (!result.isPublished) {
      return { label: 'Gözləmədə', color: 'default' };
    }
    const score = result.score || 0;
    if (score >= 50) {
      return { label: 'Keçdi', color: 'success' };
    }
    return { label: 'Kəsildi', color: 'error' };
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
          İmtahan Nəticələri
        </Typography>
        <Typography variant="h6" color="text.secondary">
          İmtahan nəticələrinizi və statistikalarınızı görmək
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
                <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
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
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />
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
                    Keçən İmtahanlar
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.passedExams}
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
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
                    Ən Yüksək Bal
                  </Typography>
                  <Typography variant="h4" component="div">
                    {statistics.highestScore}%
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Results Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            İmtahan Nəticələri
          </Typography>
          
          {results.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Hələ heç bir imtahan nəticəsi yoxdur
              </Typography>
              <Typography variant="body1" color="text.secondary">
                İmtahan verdikdən sonra nəticələr burada görünəcək
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>İmtahan Adı</TableCell>
                    <TableCell>Fənn</TableCell>
                    <TableCell>Tarix</TableCell>
                    <TableCell>Bal</TableCell>
                    <TableCell>Qiymət</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Əməliyyatlar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result) => {
                    const status = getStatus(result);
                    return (
                      <TableRow key={result._id}>
                        <TableCell>{result.exam?.name || 'N/A'}</TableCell>
                        <TableCell>{result.exam?.subject?.name || 'N/A'}</TableCell>
                        <TableCell>{formatDate(result.createdAt)}</TableCell>
                        <TableCell>
                          {result.isPublished ? (
                            <Chip 
                              label={`${result.score || 0}%`}
                              color={getScoreColor(result.score || 0)}
                              size="small"
                            />
                          ) : (
                            <Chip label="Gözləmədə" color="default" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {result.isPublished ? (
                            <Chip 
                              label={getGrade(result.score || 0)}
                              color={getScoreColor(result.score || 0)}
                              size="small"
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewDetails(result)}
                            disabled={!result.isPublished}
                          >
                            Detallar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Result Details Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              İmtahan Nəticəsi Detalları
            </Typography>
            <Button
              onClick={() => setDetailDialogOpen(false)}
              startIcon={<CloseIcon />}
              size="small"
            >
              Bağla
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>İmtahan:</strong> {selectedResult.exam?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Fənn:</strong> {selectedResult.exam?.subject?.name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Tarix:</strong> {formatDate(selectedResult.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Bal:</strong> {selectedResult.score || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Qiymət:</strong> {getGrade(selectedResult.score || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> {getStatus(selectedResult).label}
                  </Typography>
                </Grid>
              </Grid>

              {selectedResult.remarks && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Qeydlər:</strong> {selectedResult.remarks}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ExamResultsPage;

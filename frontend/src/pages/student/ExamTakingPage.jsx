import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider
} from '@mui/material';
import {
  Timer as TimerIcon,
  Send as SendIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { studentAPI, generalAPI } from '../../services/api';

const ExamTakingPage = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStartTime, setExamStartTime] = useState(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);

  useEffect(() => {
    loadExamData();
  }, [examId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Vaxt bitdi - avtomatik təslim et
            handleAutoSubmit();
            return 0;
          }
          
          // Son 5 dəqiqə xəbərdarlığı
          if (prev <= 300 && !timeWarning) {
            setTimeWarning(true);
          }
          
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeLeft, timeWarning]);

  const loadExamData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // İmtahan məlumatlarını yüklə
      const examResponse = await generalAPI.getExam(examId);
      const examData = examResponse.data?.exam || examResponse.data?.data;
      
      if (!examData) {
        throw new Error('İmtahan tapılmadı');
      }
      
      setExam(examData);
      
      // İmtahan suallarını yüklə
      const questionsResponse = await generalAPI.getExamQuestions(examId);
      const questionsData = questionsResponse.data?.questions || questionsResponse.data?.data || [];
      
      setQuestions(questionsData);
      
      // Vaxt hesablaması
      const startTime = new Date();
      setExamStartTime(startTime);
      setTimeLeft(examData.duration * 60); // dəqiqəni saniyəyə çevir
      
    } catch (err) {
      console.error('Error loading exam data:', err);
      setError(err.response?.data?.message || 'İmtahan yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitExam = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Cavabları hazırla
      const examAnswers = questions.map(question => ({
        questionId: question._id,
        answer: answers[question._id] || ''
      }));
      
      // İmtahanı təslim et
      await studentAPI.writeExam(examId, { answers: examAnswers });
      
      // Uğurlu təslim etmə səhifəsinə yönləndir
      navigate('/student/exam-success', { 
        state: { 
          examName: exam.name,
          questionsCount: questions.length,
          answeredCount: Object.keys(answers).length
        }
      });
      
    } catch (err) {
      console.error('Error submitting exam:', err);
      setError(err.response?.data?.message || 'İmtahan təslim edilərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
      setConfirmSubmitOpen(false);
    }
  };

  const handleAutoSubmit = async () => {
    // Vaxt bitdikdə avtomatik təslim et
    await handleSubmitExam();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 300) return 'error'; // Son 5 dəqiqə
    if (timeLeft <= 600) return 'warning'; // Son 10 dəqiqə
    return 'success';
  };

  const getProgressPercentage = () => {
    if (!exam) return 0;
    const totalTime = exam.duration * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
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
        <Button variant="contained" onClick={() => navigate('/student/exams')}>
          Geri Qayıt
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header with Timer */}
      <Card sx={{ mb: 3, position: 'sticky', top: 0, zIndex: 10 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                {exam?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {exam?.description}
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <TimerIcon sx={{ mr: 1, color: getTimeColor() }} />
                <Typography variant="h6" color={getTimeColor()}>
                  {formatTime(timeLeft)}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getProgressPercentage()} 
                color={getTimeColor()}
                sx={{ width: 200, height: 8, borderRadius: 4 }}
              />
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Box>
              <Chip 
                label={`${getAnsweredCount()}/${questions.length} cavablandı`}
                color={getAnsweredCount() === questions.length ? 'success' : 'default'}
                size="small"
              />
            </Box>
            
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => setConfirmSubmitOpen(true)}
              disabled={submitting}
            >
              İmtahanı Təslim Et
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Time Warning */}
      {timeWarning && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Diqqət!</strong> İmtahan vaxtınız az qalıb. Zəhmət olmasa cavablarınızı yoxlayın.
        </Alert>
      )}

      {/* Questions */}
      <Box>
        {questions.map((question, index) => (
          <Card key={question._id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sual {index + 1}
              </Typography>
              <Typography variant="body1" paragraph>
                {question.question}
              </Typography>
              
              <RadioGroup
                value={answers[question._id] || ''}
                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              >
                <FormControlLabel
                  value="optionA"
                  control={<Radio />}
                  label={`A) ${question.optionA}`}
                />
                <FormControlLabel
                  value="optionB"
                  control={<Radio />}
                  label={`B) ${question.optionB}`}
                />
                <FormControlLabel
                  value="optionC"
                  control={<Radio />}
                  label={`C) ${question.optionC}`}
                />
                <FormControlLabel
                  value="optionD"
                  control={<Radio />}
                  label={`D) ${question.optionD}`}
                />
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Submit Confirmation Dialog */}
      <Dialog open={confirmSubmitOpen} onClose={() => setConfirmSubmitOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
            İmtahanı Təslim Et
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            İmtahanı təslim etməyə əminsiniz?
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Ümumi suallar:</strong> {questions.length}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Cavablanmış suallar:</strong> {getAnsweredCount()}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Cavablanmamış suallar:</strong> {questions.length - getAnsweredCount()}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Qalan vaxt:</strong> {formatTime(timeLeft)}
            </Typography>
          </Box>
          
          {getAnsweredCount() < questions.length && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Bəzi suallar cavablanmamışdır. Təslim etdikdən sonra dəyişiklik edə bilməyəcəksiniz.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmitOpen(false)} disabled={submitting}>
            Davam Et
          </Button>
          <Button 
            onClick={handleSubmitExam} 
            variant="contained" 
            startIcon={<SendIcon />}
            disabled={submitting}
          >
            {submitting ? 'Təslim edilir...' : 'Təslim Et'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExamTakingPage;

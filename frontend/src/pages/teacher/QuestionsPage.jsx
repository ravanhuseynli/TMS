import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'optionA',
    examId: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadQuestions();
    loadExams();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await teacherAPI.getQuestions();
      const questionsData = response.data?.questions || response.data?.data || [];
      setQuestions(questionsData);
      
    } catch (err) {
      console.error('Error loading questions:', err);
      setError(err.response?.data?.message || 'Suallar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async () => {
    try {
      const response = await teacherAPI.getExams();
      const examsData = response.data?.exams || response.data?.data || [];
      setExams(examsData);
    } catch (err) {
      console.error('Error loading exams:', err);
    }
  };

  const handleOpenDialog = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question: question.question || '',
        optionA: question.optionA || '',
        optionB: question.optionB || '',
        optionC: question.optionC || '',
        optionD: question.optionD || '',
        correctAnswer: question.correctAnswer || 'optionA',
        examId: question.examId || ''
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'optionA',
        examId: ''
      });
    }
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
    setValidationErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.question.trim()) errors.question = 'Sual mətni tələb olunur';
    if (!formData.optionA.trim()) errors.optionA = 'A variantı tələb olunur';
    if (!formData.optionB.trim()) errors.optionB = 'B variantı tələb olunur';
    if (!formData.optionC.trim()) errors.optionC = 'C variantı tələb olunur';
    if (!formData.optionD.trim()) errors.optionD = 'D variantı tələb olunur';
    if (!formData.correctAnswer) errors.correctAnswer = 'Düzgün cavab tələb olunur';
    if (!formData.examId) errors.examId = 'İmtahan seçimi tələb olunur';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const questionData = {
        question: formData.question,
        optionA: formData.optionA,
        optionB: formData.optionB,
        optionC: formData.optionC,
        optionD: formData.optionD,
        correctAnswer: formData.correctAnswer
      };
      
      if (editingQuestion) {
        await teacherAPI.updateQuestion(editingQuestion._id, questionData);
      } else {
        await teacherAPI.createQuestion(formData.examId, questionData);
      }
      
      handleCloseDialog();
      loadQuestions();
      
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err.response?.data?.message || 'Sual saxlanılarkən xəta baş verdi');
    }
  };

  const getCorrectAnswerLabel = (answer) => {
    switch (answer) {
      case 'optionA': return 'A';
      case 'optionB': return 'B';
      case 'optionC': return 'C';
      case 'optionD': return 'D';
      default: return answer;
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sual İdarəsi
        </Typography>
        <Typography variant="h6" color="text.secondary">
          İmtahan suallarını yaradın və redaktə edin
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Yeni Sual Yarat
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sual</TableCell>
                <TableCell>Düzgün Cavab</TableCell>
                <TableCell>İmtahan</TableCell>
                <TableCell>Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question._id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {question.question?.length > 80 
                        ? question.question.substring(0, 80) + '...' 
                        : question.question}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getCorrectAnswerLabel(question.correctAnswer)} 
                      color="success"
                      size="small"
                      icon={<CheckIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    {question.exam?.name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenDialog(question)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => console.log('View question:', question)}
                      color="info"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">
                      Hələ sual yoxdur
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for Create/Edit Question */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {editingQuestion ? 'Sual Redaktə et' : 'Yeni Sual Yarat'}
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sual Mətni"
                multiline
                rows={3}
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
                error={!!validationErrors.question}
                helperText={validationErrors.question}
                margin="normal"
              />
            </Grid>
            
            {!editingQuestion && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.examId}>
                  <InputLabel>İmtahan</InputLabel>
                  <Select
                    value={formData.examId}
                    onChange={(e) => handleInputChange('examId', e.target.value)}
                  >
                    {exams.map((exam) => (
                      <MenuItem key={exam._id} value={exam._id}>
                        {exam.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.examId && (
                    <FormHelperText>{validationErrors.examId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="A Variantı"
                value={formData.optionA}
                onChange={(e) => handleInputChange('optionA', e.target.value)}
                error={!!validationErrors.optionA}
                helperText={validationErrors.optionA}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="B Variantı"
                value={formData.optionB}
                onChange={(e) => handleInputChange('optionB', e.target.value)}
                error={!!validationErrors.optionB}
                helperText={validationErrors.optionB}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="C Variantı"
                value={formData.optionC}
                onChange={(e) => handleInputChange('optionC', e.target.value)}
                error={!!validationErrors.optionC}
                helperText={validationErrors.optionC}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="D Variantı"
                value={formData.optionD}
                onChange={(e) => handleInputChange('optionD', e.target.value)}
                error={!!validationErrors.optionD}
                helperText={validationErrors.optionD}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!validationErrors.correctAnswer}>
                <FormLabel component="legend">Düzgün Cavab</FormLabel>
                <RadioGroup
                  value={formData.correctAnswer}
                  onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                  row
                >
                  <FormControlLabel value="optionA" control={<Radio />} label="A Variantı" />
                  <FormControlLabel value="optionB" control={<Radio />} label="B Variantı" />
                  <FormControlLabel value="optionC" control={<Radio />} label="C Variantı" />
                  <FormControlLabel value="optionD" control={<Radio />} label="D Variantı" />
                </RadioGroup>
                {validationErrors.correctAnswer && (
                  <FormHelperText>{validationErrors.correctAnswer}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Ləğv et</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingQuestion ? 'Yenilə' : 'Yarat'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuestionsPage; 
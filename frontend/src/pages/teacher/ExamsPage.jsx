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
  Divider,
  Tooltip,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Quiz as QuizIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Subject as SubjectIcon,
  Class as ClassIcon,
  Book as BookIcon,
  Timer as TimerIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { teacherAPI, generalAPI } from '../../services/api';

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    academicTerm: '',
    academicYear: '',
    classLevel: '',
    subject: '',
    program: '',
    duration: '',
    examDate: '',
    examTime: '',
    examType: 'quiz'
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [options, setOptions] = useState({
    academicTerms: [],
    academicYears: [],
    classLevels: [],
    subjects: [],
    programs: []
  });

  useEffect(() => {
    loadExams();
    loadOptions();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await teacherAPI.getExams();
      console.log('Exams Response:', response);
      
      const examsData = response.data?.exams || response.data?.data || [];
      setExams(examsData);
      
    } catch (err) {
      console.error('Error loading exams:', err);
      setError(err.response?.data?.message || 'İmtahanlar yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      
      const [termsResponse, yearsResponse, levelsResponse, subjectsResponse, programsResponse] = await Promise.all([
        generalAPI.getAcademicTerms(),
        fetch('/api/v1/academic-years').then(res => res.json()).catch(() => ({ data: [] })),
        fetch('/api/v1/class-levels').then(res => res.json()).catch(() => ({ data: [] })),
        teacherAPI.getSubjects(),
        fetch('/api/v1/programs').then(res => res.json()).catch(() => ({ data: [] }))
      ]);

      setOptions({
        academicTerms: termsResponse.data || [],
        academicYears: yearsResponse.data || [],
        classLevels: levelsResponse.data || [],
        subjects: subjectsResponse.data?.subjects || subjectsResponse.data?.data || [],
        programs: programsResponse.data || []
      });
      
    } catch (err) {
      console.error('Error loading options:', err);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleOpenDialog = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        name: exam.name || '',
        description: exam.description || '',
        academicTerm: exam.academicTerm || '',
        academicYear: exam.academicYear || '',
        classLevel: exam.classLevel || '',
        subject: exam.subject || '',
        program: exam.program || '',
        duration: exam.duration || '',
        examDate: exam.examDate || '',
        examTime: exam.examTime || '',
        examType: exam.examType || 'quiz'
      });
    } else {
      setEditingExam(null);
      setFormData({
        name: '',
        description: '',
        academicTerm: '',
        academicYear: '',
        classLevel: '',
        subject: '',
        program: '',
        duration: '',
        examDate: '',
        examTime: '',
        examType: 'quiz'
      });
    }
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExam(null);
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
    
    if (!formData.name.trim()) errors.name = 'İmtahan adı tələb olunur';
    if (!formData.description.trim()) errors.description = 'Açıqlama tələb olunur';
    if (!formData.duration.trim()) errors.duration = 'Müddət tələb olunur';
    if (!formData.examDate.trim()) errors.examDate = 'İmtahan tarixi tələb olunur';
    if (!formData.examTime.trim()) errors.examTime = 'İmtahan vaxtı tələb olunur';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const examData = {
        ...formData
      };
      
      if (editingExam) {
        await teacherAPI.updateExam(editingExam._id, examData);
      } else {
        await teacherAPI.createExam(examData);
      }
      
      handleCloseDialog();
      loadExams();
      
    } catch (err) {
      console.error('Error saving exam:', err);
      setError(err.response?.data?.message || 'İmtahan saxlanılarkən xəta baş verdi');
    }
  };

  const getExamTypeColor = (type) => {
    switch (type) {
      case 'quiz': return 'primary';
      case 'midterm': return 'warning';
      case 'final': return 'error';
      default: return 'default';
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
            İmtahan İdarəsi
          </Typography>
          <Typography variant="h6" color="text.secondary">
            İmtahanları yaradın və redaktə edin
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
            Yeni İmtahan Yarat
          </Button>
        </Box>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>İmtahan Adı</TableCell>
                  <TableCell>Növ</TableCell>
                  <TableCell>Tarix</TableCell>
                  <TableCell>Vaxt</TableCell>
                  <TableCell>Müddət</TableCell>
                  <TableCell>Fənn</TableCell>
                  <TableCell>Əməliyyatlar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{exam.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {exam.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={exam.examType} 
                        color={getExamTypeColor(exam.examType)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(exam.examDate)}</TableCell>
                    <TableCell>{exam.examTime}</TableCell>
                    <TableCell>{exam.duration}</TableCell>
                    <TableCell>{exam.subject?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenDialog(exam)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => console.log('View exam:', exam)}
                        color="info"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {exams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="text.secondary">
                        Hələ imtahan yoxdur
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Dialog for Create/Edit Exam */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {editingExam ? 'İmtahan Redaktə et' : 'Yeni İmtahan Yarat'}
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İmtahan Adı"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.examType}>
                  <InputLabel>İmtahan Növü</InputLabel>
                  <Select
                    value={formData.examType}
                    onChange={(e) => handleInputChange('examType', e.target.value)}
                  >
                    <MenuItem value="quiz">Quiz</MenuItem>
                    <MenuItem value="midterm">Orta imtahan</MenuItem>
                    <MenuItem value="final">Final imtahan</MenuItem>
                  </Select>
                  {validationErrors.examType && (
                    <FormHelperText>{validationErrors.examType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Açıqlama"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={!!validationErrors.description}
                  helperText={validationErrors.description}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.academicTerm}>
                  <InputLabel>Tədris Mövsümü</InputLabel>
                  <Select
                    value={formData.academicTerm}
                    onChange={(e) => handleInputChange('academicTerm', e.target.value)}
                  >
                    {options.academicTerms.map((term) => (
                      <MenuItem key={term._id} value={term._id}>
                        {term.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.academicTerm && (
                    <FormHelperText>{validationErrors.academicTerm}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.academicYear}>
                  <InputLabel>Tədris İli</InputLabel>
                  <Select
                    value={formData.academicYear}
                    onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  >
                    {options.academicYears.map((year) => (
                      <MenuItem key={year._id} value={year._id}>
                        {year.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.academicYear && (
                    <FormHelperText>{validationErrors.academicYear}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.classLevel}>
                  <InputLabel>Sinif Səviyyəsi</InputLabel>
                  <Select
                    value={formData.classLevel}
                    onChange={(e) => handleInputChange('classLevel', e.target.value)}
                  >
                    {options.classLevels.map((level) => (
                      <MenuItem key={level._id} value={level._id}>
                        {level.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.classLevel && (
                    <FormHelperText>{validationErrors.classLevel}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.subject}>
                  <InputLabel>Fənn</InputLabel>
                  <Select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                  >
                    {options.subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.subject && (
                    <FormHelperText>{validationErrors.subject}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.program}>
                  <InputLabel>Proqram</InputLabel>
                  <Select
                    value={formData.program}
                    onChange={(e) => handleInputChange('program', e.target.value)}
                  >
                    {options.programs.map((program) => (
                      <MenuItem key={program._id} value={program._id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.program && (
                    <FormHelperText>{validationErrors.program}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Müddət"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  error={!!validationErrors.duration}
                  helperText={validationErrors.duration || 'Məsələn: 60 dəqiqə'}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İmtahan Tarixi"
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => handleInputChange('examDate', e.target.value)}
                  error={!!validationErrors.examDate}
                  helperText={validationErrors.examDate}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İmtahan Vaxtı"
                  value={formData.examTime}
                  onChange={(e) => handleInputChange('examTime', e.target.value)}
                  error={!!validationErrors.examTime}
                  helperText={validationErrors.examTime || 'Məsələn: 09:00'}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Ləğv et</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingExam ? 'Yenilə' : 'Yarat'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
};

export default ExamsPage; 
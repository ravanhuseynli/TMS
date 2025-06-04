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

import { teacherAPI, generalAPI, adminAPI } from '../../services/api';

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
    examType: 'quiz',
    passMark: '',
    totalMark: '',
    examStatus: 'pending'
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
        adminAPI.getAcademicYears(),
        adminAPI.getClassLevels(),
        teacherAPI.getSubjects(),
        adminAPI.getPrograms()
      ]);

      setOptions({
        academicTerms: termsResponse.data?.academicTerms || termsResponse.data || [],
        academicYears: yearsResponse.data?.academicYears || yearsResponse.data || [],
        classLevels: levelsResponse.data?.classes || levelsResponse.data || [],
        subjects: subjectsResponse.data?.subjects || subjectsResponse.data?.data || [],
        programs: programsResponse.data?.programs || programsResponse.data || []
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
        examType: exam.examType || 'quiz',
        passMark: exam.passMark || '',
        totalMark: exam.totalMark || '',
        examStatus: exam.examStatus || 'pending'
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
        examType: 'quiz',
        passMark: '',
        totalMark: '',
        examStatus: 'pending'
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
    if (!formData.passMark.trim()) errors.passMark = 'Keçid balı tələb olunur';
    if (!formData.totalMark.trim()) errors.totalMark = 'Ümumi bal tələb olunur';
    if (!formData.examStatus.trim()) errors.examStatus = 'İmtahan statusu tələb olunur';
    
    // Check if passMark is a valid number
    if (formData.passMark && isNaN(formData.passMark)) {
      errors.passMark = 'Keçid balı rəqəm olmalıdır';
    }
    
    // Check if totalMark is a valid number
    if (formData.totalMark && isNaN(formData.totalMark)) {
      errors.totalMark = 'Ümumi bal rəqəm olmalıdır';
    }
    
    // Check if passMark is not greater than totalMark
    if (formData.passMark && formData.totalMark && 
        Number(formData.passMark) > Number(formData.totalMark)) {
      errors.passMark = 'Keçid balı ümumi baldan böyük ola bilməz';
    }
    
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
                  <TableCell>Ballar</TableCell>
                  <TableCell>Status</TableCell>
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
                    <TableCell>
                      <Typography variant="body2">
                        {exam.passMark || 'N/A'} / {exam.totalMark || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={exam.examStatus === 'pending' ? 'Gözləyən' : 'Canlı'} 
                        color={exam.examStatus === 'live' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
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
                    <TableCell colSpan={9} align="center">
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
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: {
              minHeight: '600px',
              maxHeight: '90vh'
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" component="h2">
                {editingExam ? 'İmtahan Redaktə et' : 'Yeni İmtahan Yarat'}
              </Typography>
              <IconButton onClick={handleCloseDialog}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ paddingTop: '20px !important' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İmtahan Adı"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  margin="normal"
                  sx={{ fontSize: '16px' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.examType}>
                  <InputLabel sx={{ fontSize: '16px', color: '#1976d2' }}>İmtahan Növü</InputLabel>
                  <Select
                    value={formData.examType}
                    onChange={(e) => handleInputChange('examType', e.target.value)}
                    sx={{ 
                      fontSize: '16px',
                      minHeight: '56px',
                      '& .MuiSelect-select': {
                        fontSize: '16px',
                        padding: '16.5px 14px',
                        color: '#000',
                        fontWeight: '500'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '16px'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '300px',
                          '& .MuiMenuItem-root': {
                            fontSize: '16px',
                            padding: '14px 16px',
                            minHeight: '48px',
                            color: '#000',
                            fontWeight: '500',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#bbdefb'
                              }
                            }
                          }
                        }
                      }
                    }}
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
                  sx={{ fontSize: '16px' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.academicTerm}>
                  <InputLabel sx={{ fontSize: '16px', color: '#1976d2' }}>Tədris Mövsümü</InputLabel>
                  <Select
                    value={formData.academicTerm}
                    onChange={(e) => handleInputChange('academicTerm', e.target.value)}
                    sx={{ 
                      fontSize: '16px',
                      minHeight: '56px',
                      '& .MuiSelect-select': {
                        fontSize: '16px',
                        padding: '16.5px 14px',
                        color: '#000',
                        fontWeight: '500'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '16px'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '300px',
                          '& .MuiMenuItem-root': {
                            fontSize: '16px',
                            padding: '14px 16px',
                            minHeight: '48px',
                            color: '#000',
                            fontWeight: '500',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#bbdefb'
                              }
                            }
                          }
                        }
                      }
                    }}
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
                  <InputLabel sx={{ fontSize: '16px', color: '#1976d2' }}>Tədris İli</InputLabel>
                  <Select
                    value={formData.academicYear}
                    onChange={(e) => handleInputChange('academicYear', e.target.value)}
                    sx={{ 
                      fontSize: '16px',
                      minHeight: '56px',
                      '& .MuiSelect-select': {
                        fontSize: '16px',
                        padding: '16.5px 14px',
                        color: '#000',
                        fontWeight: '500'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '16px'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '300px',
                          '& .MuiMenuItem-root': {
                            fontSize: '16px',
                            padding: '14px 16px',
                            minHeight: '48px',
                            color: '#000',
                            fontWeight: '500',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#bbdefb'
                              }
                            }
                          }
                        }
                      }
                    }}
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
                  <InputLabel sx={{ fontSize: '16px', color: '#1976d2' }}>Sinif Səviyyəsi</InputLabel>
                  <Select
                    value={formData.classLevel}
                    onChange={(e) => handleInputChange('classLevel', e.target.value)}
                    sx={{ 
                      fontSize: '16px',
                      minHeight: '56px',
                      '& .MuiSelect-select': {
                        fontSize: '16px',
                        padding: '16.5px 14px',
                        color: '#000',
                        fontWeight: '500'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '16px'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '300px',
                          '& .MuiMenuItem-root': {
                            fontSize: '16px',
                            padding: '14px 16px',
                            minHeight: '48px',
                            color: '#000',
                            fontWeight: '500',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#bbdefb'
                              }
                            }
                          }
                        }
                      }
                    }}
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
                  <InputLabel sx={{ fontSize: '16px', color: '#1976d2' }}>Fənn</InputLabel>
                  <Select
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    sx={{ 
                      fontSize: '16px',
                      minHeight: '56px',
                      '& .MuiSelect-select': {
                        fontSize: '16px',
                        padding: '16.5px 14px',
                        color: '#000',
                        fontWeight: '500'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '16px'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '300px',
                          '& .MuiMenuItem-root': {
                            fontSize: '16px',
                            padding: '14px 16px',
                            minHeight: '48px',
                            color: '#000',
                            fontWeight: '500',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#bbdefb'
                              }
                            }
                          }
                        }
                      }
                    }}
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
                  <InputLabel sx={{ fontSize: '16px', color: '#1976d2' }}>Proqram</InputLabel>
                  <Select
                    value={formData.program}
                    onChange={(e) => handleInputChange('program', e.target.value)}
                    sx={{ 
                      fontSize: '16px',
                      minHeight: '56px',
                      '& .MuiSelect-select': {
                        fontSize: '16px',
                        padding: '16.5px 14px',
                        color: '#000',
                        fontWeight: '500'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '16px'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '300px',
                          '& .MuiMenuItem-root': {
                            fontSize: '16px',
                            padding: '14px 16px',
                            minHeight: '48px',
                            color: '#000',
                            fontWeight: '500',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#bbdefb'
                              }
                            }
                          }
                        }
                      }
                    }}
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
                  sx={{ fontSize: '16px' }}
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
                  sx={{ fontSize: '16px' }}
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
                  sx={{ fontSize: '16px' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Keçid Balı"
                  type="number"
                  value={formData.passMark}
                  onChange={(e) => handleInputChange('passMark', e.target.value)}
                  error={!!validationErrors.passMark}
                  helperText={validationErrors.passMark || 'Məsələn: 50'}
                  margin="normal"
                  sx={{ fontSize: '16px' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ümumi Bal"
                  type="number"
                  value={formData.totalMark}
                  onChange={(e) => handleInputChange('totalMark', e.target.value)}
                  error={!!validationErrors.totalMark}
                  helperText={validationErrors.totalMark || 'Məsələn: 100'}
                  margin="normal"
                  sx={{ fontSize: '16px' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.examStatus}>
                  <InputLabel sx={{ fontSize: '16px', color: '#1976d2' }}>İmtahan Statusu</InputLabel>
                  <Select
                    value={formData.examStatus}
                    onChange={(e) => handleInputChange('examStatus', e.target.value)}
                    sx={{ 
                      fontSize: '16px',
                      minHeight: '56px',
                      '& .MuiSelect-select': {
                        fontSize: '16px',
                        padding: '16.5px 14px',
                        color: '#000',
                        fontWeight: '500'
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: '16px'
                      }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '300px',
                          '& .MuiMenuItem-root': {
                            fontSize: '16px',
                            padding: '14px 16px',
                            minHeight: '48px',
                            color: '#000',
                            fontWeight: '500',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: '#bbdefb'
                              }
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="pending">Gözləyən</MenuItem>
                    <MenuItem value="live">Canlı</MenuItem>
                  </Select>
                  {validationErrors.examStatus && (
                    <FormHelperText>{validationErrors.examStatus}</FormHelperText>
                  )}
                </FormControl>
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
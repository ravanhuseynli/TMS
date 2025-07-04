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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Subject as SubjectIcon,
  School as SchoolIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [academicTerms, setAcademicTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    academicTerm: '',
    programId: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadSubjects();
    loadPrograms();
    loadAcademicTerms();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await teacherAPI.getSubjects();
      const subjectsData = response.data?.subjects || response.data?.data || [];
      setSubjects(subjectsData);
      
    } catch (err) {
      console.error('Error loading subjects:', err);
      setError(err.response?.data?.message || 'Fənlər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await fetch('/api/v1/programs');
      const data = await response.json();
      setPrograms(data.data || []);
    } catch (err) {
      console.error('Error loading programs:', err);
    }
  };

  const loadAcademicTerms = async () => {
    try {
      const response = await fetch('/api/v1/academic-terms');
      const data = await response.json();
      setAcademicTerms(data.data || []);
    } catch (err) {
      console.error('Error loading academic terms:', err);
    }
  };

  const handleOpenDialog = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name || '',
        description: subject.description || '',
        academicTerm: subject.academicTerm || '',
        programId: subject.programId || ''
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        description: '',
        academicTerm: '',
        programId: ''
      });
    }
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubject(null);
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
    
    if (!formData.name.trim()) errors.name = 'Fənn adı tələb olunur';
    if (!formData.description.trim()) errors.description = 'Açıqlama tələb olunur';
    if (!formData.academicTerm) errors.academicTerm = 'Tədris mövsümü tələb olunur';
    if (!formData.programId) errors.programId = 'Proqram seçimi tələb olunur';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const subjectData = {
        name: formData.name,
        description: formData.description,
        academicTerm: formData.academicTerm
      };
      
      if (editingSubject) {
        await teacherAPI.updateSubject(editingSubject._id, subjectData);
      } else {
        await teacherAPI.createSubject(formData.programId, subjectData);
      }
      
      handleCloseDialog();
      loadSubjects();
      
    } catch (err) {
      console.error('Error saving subject:', err);
      setError(err.response?.data?.message || 'Fənn saxlanılarkən xəta baş verdi');
    }
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Bu fənni silmək istədiyinizə əminsiniz?')) {
      try {
        await teacherAPI.deleteSubject(subjectId);
        loadSubjects();
      } catch (err) {
        console.error('Error deleting subject:', err);
        setError(err.response?.data?.message || 'Fənn silinərkən xəta baş verdi');
      }
    }
  };

  const getProgramName = (programId) => {
    const program = programs.find(p => p._id === programId);
    return program ? program.name : 'N/A';
  };

  const getAcademicTermName = (termId) => {
    const term = academicTerms.find(t => t._id === termId);
    return term ? term.name : 'N/A';
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
          Fənlər
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Fənn idarəsi səhifəsi
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
          Yeni Fənn Yarat
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fənn Adı</TableCell>
                <TableCell>Açıqlama</TableCell>
                <TableCell>Tədris Mövsümü</TableCell>
                <TableCell>Proqram</TableCell>
                <TableCell>Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <SubjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2">{subject.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {subject.description?.length > 100 
                        ? subject.description.substring(0, 100) + '...' 
                        : subject.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getAcademicTermName(subject.academicTerm)}
                      color="primary"
                      size="small"
                      icon={<DateRangeIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getProgramName(subject.program)}
                      color="secondary"
                      size="small"
                      icon={<SchoolIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Redaktə et">
                      <IconButton
                        onClick={() => handleOpenDialog(subject)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        onClick={() => handleDelete(subject._id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bax">
                      <IconButton
                        onClick={() => console.log('View subject:', subject)}
                        color="info"
                        size="small"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {subjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      Hələ fənn yoxdur
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog for Create/Edit Subject */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {editingSubject ? 'Fənn Redaktə et' : 'Yeni Fənn Yarat'}
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
                label="Fənn Adı"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                margin="normal"
              />
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
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" error={!!validationErrors.academicTerm}>
                <InputLabel>Tədris Mövsümü</InputLabel>
                <Select
                  value={formData.academicTerm}
                  onChange={(e) => handleInputChange('academicTerm', e.target.value)}
                >
                  {academicTerms.map((term) => (
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
            
            {!editingSubject && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" error={!!validationErrors.programId}>
                  <InputLabel>Proqram</InputLabel>
                  <Select
                    value={formData.programId}
                    onChange={(e) => handleInputChange('programId', e.target.value)}
                  >
                    {programs.map((program) => (
                      <MenuItem key={program._id} value={program._id}>
                        {program.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.programId && (
                    <FormHelperText>{validationErrors.programId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Ləğv et</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSubject ? 'Yenilə' : 'Yarat'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubjectsPage; 
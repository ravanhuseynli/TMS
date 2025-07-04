import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  TablePagination,
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Book as BookIcon,
  Visibility as ViewIcon,
  MenuBook as SubjectIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';

const API_BASE_URL = 'http://127.0.0.1:8000';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [academicTerms, setAcademicTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Form states - Only API documentation fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    academicTerm: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchAcademicTerms();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
        setError('');
      } else {
        setError('Fənlər yüklənərkən xəta baş verdi');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Fənlər yüklənərkən xəta baş verdi');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicTerms = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/academic-terms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAcademicTerms(data.academicTerms || []);
      }
    } catch (error) {
      console.error('Error fetching academic terms:', error);
    }
  };

  const handleOpenDialog = (mode, subject = null) => {
    setDialogMode(mode);
    setSelectedSubject(subject);
    if (subject && mode !== 'add') {
      // Only use API documentation fields
      setFormData({
        name: subject.name || '',
        description: subject.description || '',
        academicTerm: subject.academicTerm?._id || subject.academicTerm || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        academicTerm: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
    setFormData({
      name: '',
      description: '',
      academicTerm: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Fənn adı tələb olunur';
    if (!formData.description.trim()) errors.description = 'Təsvir tələb olunur';
    if (!formData.academicTerm.trim()) errors.academicTerm = 'Akademik mövsüm tələb olunur';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('adminToken');
      
      if (dialogMode === 'add') {
        const response = await fetch(`${API_BASE_URL}/subjects`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Fənn yaradılarkən xəta baş verdi');
        }
      } else if (dialogMode === 'edit' && selectedSubject) {
        const response = await fetch(`${API_BASE_URL}/subjects/${selectedSubject._id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Fənn yenilənərkən xəta baş verdi');
        }
      }
      
      await fetchSubjects();
      handleCloseDialog();
      setError('');
    } catch (error) {
      console.error('Error saving subject:', error);
      setError(error.message || 'Fənn saxlanılarkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/subjects/${selectedSubject._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fənn silinərkən xəta baş verdi');
      }
      
      await fetchSubjects();
      setDeleteConfirmOpen(false);
      setSelectedSubject(null);
      setError('');
    } catch (error) {
      console.error('Error deleting subject:', error);
      setError('Fənn silinərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.academicTerm?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedSubjects = filteredSubjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (subject) => {
    return subject.isActive ? 'success' : 'default';
  };

  const getStatusText = (subject) => {
    return subject.isActive ? 'Aktiv' : 'Deaktiv';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Fənlər yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Fənlər
        </Typography>
        <Typography variant="body1" color="text.secondary">
          📖 Tədris fənlərini idarə edin və yenilərini əlavə edin
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Fənlər axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} textAlign="right">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('add')}
                size="large"
              >
                Yeni Fənn
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fənn</TableCell>
                <TableCell>Təsvir</TableCell>
                <TableCell>Akademik Mövsüm</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSubjects.map((subject) => (
                <TableRow key={subject._id || subject.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <SubjectIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {subject.name || 'Adsız'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {subject.code || 'Kod təyin edilməyib'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {subject.description || 'Təsvir yoxdur'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BookIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {subject.academicTerm?.name || 'Təyin edilməyib'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(subject)}
                      color={getStatusColor(subject)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Bax">
                      <IconButton onClick={() => handleOpenDialog('view', subject)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzəliş et">
                      <IconButton onClick={() => handleOpenDialog('edit', subject)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        onClick={() => {
                          setSelectedSubject(subject);
                          setDeleteConfirmOpen(true);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedSubjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir fənn tapılmadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredSubjects.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Sətir sayı:"
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Yeni Fənn Əlavə Et' : 
           dialogMode === 'edit' ? 'Fənni Düzəliş Et' : 'Fənn Məlumatları'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fənn Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={dialogMode === 'view'}
                placeholder="Məsələn: Riyaziyyat"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Təsvir"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={!!formErrors.description}
                helperText={formErrors.description}
                disabled={dialogMode === 'view'}
                multiline
                rows={3}
                placeholder="Fənn haqqında əlavə məlumat..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.academicTerm}>
                <InputLabel>Akademik Mövsüm</InputLabel>
                <Select
                  value={formData.academicTerm}
                  onChange={(e) => setFormData({ ...formData, academicTerm: e.target.value })}
                  disabled={dialogMode === 'view'}
                  label="Akademik Mövsüm"
                >
                  <MenuItem value="">
                    <em>Akademik mövsüm seçin</em>
                  </MenuItem>
                  {academicTerms.map((term) => (
                    <MenuItem key={term._id || term.id} value={term._id || term.id}>
                      {term.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.academicTerm && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {formErrors.academicTerm}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {dialogMode === 'view' ? 'Bağla' : 'Ləğv et'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmit} 
              variant="contained"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 
               (dialogMode === 'add' ? 'Əlavə et' : 'Yenilə')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Fənni Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedSubject?.name}" adlı fənni silmək istədiyinizdən əminsiniz?
            Bu əməliyyat geri qaytarıla bilməz və bağlı bütün məlumatlar silinəcək.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Ləğv et</Button>
          <Button
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectsPage; 
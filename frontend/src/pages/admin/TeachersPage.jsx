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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,

  School as SchoolIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    program: '',
    classLevel: '',
    academicYear: '',
    subject: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllTeachers();
      console.log('Teachers API Response:', response);
      console.log('Response data:', response.data);
      
      // Backend returns data in this format: { status: "success", teachers: [...] }
      const teachersData = response.data?.teachers || [];
      
      console.log('Parsed teachers data:', teachersData);
      console.log('Is array:', Array.isArray(teachersData));
      console.log('Length:', teachersData.length);
      
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setError('');
    } catch (error) {
      console.error('Error loading teachers:', error);
      setError('Müəllimlər yüklənərkən xəta baş verdi');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, teacher = null) => {
    setDialogMode(mode);
    setSelectedTeacher(teacher);
    if (teacher && mode !== 'add') {
      setFormData({
        name: teacher.name || '',
        email: teacher.email || '',
        password: '',
        passwordConfirm: '',
        program: teacher.program || '',
        classLevel: teacher.classLevel || '',
        academicYear: teacher.academicYear || '',
        subject: teacher.subject || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        program: '',
        classLevel: '',
        academicYear: '',
        subject: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeacher(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      program: '',
      classLevel: '',
      academicYear: '',
      subject: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    // Ad və email yalnız yaradılma zamanı tələb olunur
    if (dialogMode === 'add') {
      if (!formData.name.trim()) errors.name = 'Ad tələb olunur';
      if (!formData.email.trim()) errors.email = 'Email tələb olunur';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Düzgün email daxil edin';
      
      if (!formData.password) errors.password = 'Şifrə tələb olunur';
      if (formData.password.length < 6) errors.password = 'Şifrə ən azı 6 simvol olmalıdır';
      if (formData.password !== formData.passwordConfirm) errors.passwordConfirm = 'Şifrələr uyğun deyil';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      if (dialogMode === 'add') {
        // Backend yalnız bu field-ləri qəbul edir yaradılma üçün
        const createData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm
        };
        await adminAPI.signupTeacher(createData);
      } else if (dialogMode === 'edit' && selectedTeacher) {
        // Backend yalnız bu field-ləri qəbul edir update üçün
        const updateData = {
          program: formData.program || undefined,
          classLevel: formData.classLevel || undefined,
          academicYear: formData.academicYear || undefined,
          subject: formData.subject || undefined
        };
        // Undefined field-ləri sil
        Object.keys(updateData).forEach(key => 
          updateData[key] === undefined && delete updateData[key]
        );
        await adminAPI.updateTeacher(selectedTeacher._id || selectedTeacher.id, updateData);
      }
      
      await loadTeachers();
      handleCloseDialog();
      setError('');
    } catch (error) {
      console.error('Error saving teacher:', error);
      setError(error.response?.data?.message || 'Müəllim məlumatları saxlanılarkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;

    try {
      setSubmitting(true);
      // Note: API documentation doesn't show delete endpoint for teachers
      // You can implement soft delete by updating isWithdrawn status
      await adminAPI.updateTeacher(selectedTeacher._id || selectedTeacher.id, { isWithdrawn: true });
      
      await loadTeachers();
      setDeleteConfirmOpen(false);
      setSelectedTeacher(null);
      setError('');
    } catch (error) {
      console.error('Error deleting teacher:', error);
      setError('Müəllim silinərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTeachers = filteredTeachers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Müəllimlər yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Müəllimlər
        </Typography>
        <Typography variant="body1" color="text.secondary">
          👨‍🏫 Müəllimləri idarə edin və yenilərini əlavə edin
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
                placeholder="Müəllim axtar..."
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
                Yeni Müəllim
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Müəllim</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Fən/Proqram</TableCell>
                <TableCell>Sinif Səviyyəsi</TableCell>
                <TableCell>Akademik İl</TableCell>
                <TableCell align="center">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTeachers.map((teacher) => (
                <TableRow key={teacher._id || teacher.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {teacher.name?.charAt(0)?.toUpperCase() || 'M'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {teacher.name || 'Adsız'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {teacher._id || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{teacher.email || 'N/A'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {teacher.subject && (
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <SchoolIcon fontSize="small" color="primary" />
                          <Typography variant="body2">{teacher.subject}</Typography>
                        </Box>
                      )}
                      {teacher.program && (
                        <Typography variant="body2" color="text.secondary">
                          Proqram: {teacher.program}
                        </Typography>
                      )}
                      {!teacher.subject && !teacher.program && (
                        <Typography variant="body2" color="text.secondary">
                          Təyin edilməyib
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {teacher.classLevel || 'Təyin edilməyib'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {teacher.academicYear || 'Təyin edilməyib'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Bax">
                      <IconButton onClick={() => handleOpenDialog('view', teacher)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzəliş et">
                      <IconButton onClick={() => handleOpenDialog('edit', teacher)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        onClick={() => {
                          setSelectedTeacher(teacher);
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
              {paginatedTeachers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir müəllim tapılmadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredTeachers.length}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Yeni Müəllim Əlavə Et' : 
           dialogMode === 'edit' ? 'Müəllimin Akademik Məlumatlarını Düzəliş Et' : 'Müəllim Məlumatları'}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'edit' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Ad və email məlumatları dəyişdirilə bilməz. Yalnız akademik məlumatları yeniləyə bilərsiniz.
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ad Soyad"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={dialogMode === 'view' || dialogMode === 'edit'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={dialogMode === 'view' || dialogMode === 'edit'}
              />
            </Grid>
            
            {dialogMode === 'add' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Şifrə"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Şifrə Təkrarı"
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    error={!!formErrors.passwordConfirm}
                    helperText={formErrors.passwordConfirm}
                  />
                </Grid>
              </>
            )}
            
            {(dialogMode === 'edit' || dialogMode === 'view') && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mt: 1 }}>
                    Akademik Məlumatlar
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Fən"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    disabled={dialogMode === 'view'}
                    placeholder="Məsələn: Riyaziyyat, Fizika, Kimya"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Sinif Səviyyəsi"
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    disabled={dialogMode === 'view'}
                    placeholder="Məsələn: 1-ci sinif, 5-ci sinif"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Proqram"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    disabled={dialogMode === 'view'}
                    placeholder="Müəllimin aid olduğu proqram"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Akademik İl"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    disabled={dialogMode === 'view'}
                    placeholder="Məsələn: 2023-2024"
                  />
                </Grid>
              </>
            )}
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
        <DialogTitle>Müəllimi Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedTeacher?.name}" adlı müəllimi silmək istədiyinizdən əminsiniz?
            Bu əməliyyat müəllimi sistemdən çıxaracaq.
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

export default TeachersPage; 
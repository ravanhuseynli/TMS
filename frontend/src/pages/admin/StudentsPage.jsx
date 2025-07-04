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
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  DateRange as DateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Dropdown data
  const [programs, setPrograms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [academicTerms, setAcademicTerms] = useState([]);
  
  // Form states - API documentation-a uyğun
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    classLevel: '',
    academicYear: '',
    academicTerm: '', 
    program: '',
    dateAdmitted: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    studentId: '',
    isWithdrawn: false,
    isSuspended: false,
    yearGraduated: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadStudents(),
      loadPrograms(),
      loadClassLevels(), 
      loadAcademicYears(),
      loadAcademicTerms()
    ]);
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      console.log('Loading students...');
      const response = await adminAPI.getAllStudents();
      console.log('Students API full response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      // API response structure yoxlanması
      let studentsData = [];
      if (response.data?.students) {
        studentsData = response.data.students;
      } else if (response.data?.data) {
        studentsData = response.data.data;
      } else if (response.data?.results) {
        studentsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        studentsData = response.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
      }
      
      console.log('Parsed students data:', studentsData);
      console.log('Students count:', studentsData.length);
      
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setError('');
    } catch (error) {
      console.error('Error loading students:', error);
      console.error('Error response:', error.response);
      setError('Şagirdlər yüklənərkən xəta baş verdi: ' + (error.response?.data?.message || error.message));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await adminAPI.getPrograms();
      const programsData = response.data?.data || response.data?.results || response.data || [];
      setPrograms(Array.isArray(programsData) ? programsData : []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadClassLevels = async () => {
    try {
      const response = await adminAPI.getClassLevels();
      const classLevelsData = response.data?.data || response.data?.results || response.data || [];
      setClassLevels(Array.isArray(classLevelsData) ? classLevelsData : []);
    } catch (error) {
      console.error('Error loading class levels:', error);
    }
  };

  const loadAcademicYears = async () => {
    try {
      const response = await adminAPI.getAcademicYears();
      const academicYearsData = response.data?.data || response.data?.results || response.data || [];
      setAcademicYears(Array.isArray(academicYearsData) ? academicYearsData : []);
    } catch (error) {
      console.error('Error loading academic years:', error);
    }
  };

  const loadAcademicTerms = async () => {
    try {
      const response = await adminAPI.getAcademicTerms();
      const academicTermsData = response.data?.data || response.data?.results || response.data || [];
      setAcademicTerms(Array.isArray(academicTermsData) ? academicTermsData : []);
    } catch (error) {
      console.error('Error loading academic terms:', error);
    }
  };

  const handleOpenDialog = (mode, student = null) => {
    setDialogMode(mode);
    setSelectedStudent(student);
    if (student && mode !== 'add') {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        password: '',
        passwordConfirm: '',
        classLevel: student.classLevel?._id || student.classLevel || '',
        academicYear: student.academicYear?._id || student.academicYear || '',
        academicTerm: student.academicTerm?._id || student.academicTerm || '',
        program: student.program?._id || student.program || '',
        dateAdmitted: student.dateAdmitted ? student.dateAdmitted.split('T')[0] : '',
        parentName: student.parentName || '',
        parentEmail: student.parentEmail || '',
        parentPhone: student.parentPhone || '',
        address: student.address || '',
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        gender: student.gender || '',
        studentId: student.studentId || '',
        isWithdrawn: student.isWithdrawn || false,
        isSuspended: student.isSuspended || false,
        yearGraduated: student.yearGraduated || ''
      });
    } else {
      // Yeni şagird üçün yalnız API documentation-a uyğun sahələr
      setFormData({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        classLevel: '',
        academicYear: '',
        academicTerm: '',
        program: '',
        dateAdmitted: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        address: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        studentId: '', // API tərəfindən avtomatik yaradılacaq
        isWithdrawn: false,
        isSuspended: false,
        yearGraduated: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    // API documentation-a uyğun tələb olunan sahələr
    if (!formData.name.trim()) {
      errors.name = 'Ad və soyad tələb olunur';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email tələb olunur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Düzgün email formatı daxil edin';
    }
    
    // Password yalnız yeni şagird əlavə edərkən tələb olunur (API documentation)
    if (dialogMode === 'add') {
      if (!formData.password) {
        errors.password = 'Şifrə tələb olunur';
      } else if (formData.password.length < 6) {
        errors.password = 'Şifrə ən azı 6 simvol olmalıdır';
      }
      
      if (formData.password !== formData.passwordConfirm) {
        errors.passwordConfirm = 'Şifrələr uyğun gəlmir';
      }
    }
    
    // Edit/View mode üçün əlavə validation (API documentation-da signup zamanı tələb olunmur)
    if (dialogMode !== 'add') {
      if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
        errors.phone = 'Düzgün telefon nömrəsi daxil edin';
      }
      
      if (formData.parentPhone && !/^[\d\s\-\+\(\)]+$/.test(formData.parentPhone)) {
        errors.parentPhone = 'Düzgün telefon nömrəsi daxil edin';
      }
      
      if (formData.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
        errors.parentEmail = 'Düzgün email formatı daxil edin';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      if (dialogMode === 'add') {
        // API documentation-a uyğun - yalnız signup üçün tələb olunan sahələr
        const signupData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          passwordConfirm: formData.passwordConfirm
        };
        
        console.log('Creating student with data:', signupData);
        await adminAPI.signupStudent(signupData);
      } else if (dialogMode === 'edit' && selectedStudent) {
        // Edit mode - bütün sahələri göndər
        const updateData = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          ...(formData.classLevel && { classLevel: formData.classLevel }),
          ...(formData.academicYear && { academicYear: formData.academicYear }),
          ...(formData.academicTerm && { academicTerm: formData.academicTerm }),
          ...(formData.program && { program: formData.program }),
          ...(formData.dateAdmitted && { dateAdmitted: formData.dateAdmitted }),
          ...(formData.parentName && { parentName: formData.parentName.trim() }),
          ...(formData.parentEmail && { parentEmail: formData.parentEmail.trim() }),
          ...(formData.parentPhone && { parentPhone: formData.parentPhone.trim() }),
          ...(formData.address && { address: formData.address.trim() }),
          ...(formData.phone && { phone: formData.phone.trim() }),
          ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
          ...(formData.gender && { gender: formData.gender }),
          ...(formData.studentId && { studentId: formData.studentId }),
          isWithdrawn: formData.isWithdrawn,
          isSuspended: formData.isSuspended,
          ...(formData.yearGraduated && { yearGraduated: formData.yearGraduated })
        };
        
        console.log('Updating student with data:', updateData);
        await adminAPI.updateStudent(selectedStudent._id || selectedStudent.id, updateData);
      }
      
      await loadStudents();
      handleCloseDialog();
      setError('');
    } catch (error) {
      console.error('Error saving student:', error);
      setError(error.response?.data?.message || 'Şagird məlumatları saxlanılarkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;

    try {
      setSubmitting(true);
      // Soft delete - isWithdrawn true et
      await adminAPI.updateStudent(selectedStudent._id || selectedStudent.id, { 
        isWithdrawn: true 
      });
      
      await loadStudents();
      setDeleteConfirmOpen(false);
      setSelectedStudent(null);
      setError('');
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Şagird silinərkən xəta baş verdi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof student.classLevel === 'string' ? 
      student.classLevel.toLowerCase().includes(searchTerm.toLowerCase()) :
      student.classLevel?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedStudents = filteredStudents.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Debug məlumatları
  console.log('Students array:', students);
  console.log('Students length:', students.length);
  console.log('Filtered students length:', filteredStudents.length);
  console.log('Paginated students length:', paginatedStudents.length);
  console.log('Search term:', searchTerm);
  console.log('Current page:', page);
  console.log('Rows per page:', rowsPerPage);

  const getStatusColor = (student) => {
    if (student.isWithdrawn) return 'error';
    if (student.isSuspended) return 'warning';
    return 'success';
  };

  const getStatusText = (student) => {
    if (student.isWithdrawn) return 'Çıxarılıb';
    if (student.isSuspended) return 'Müvəqqəti dayandırılıb';
    return 'Aktiv';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Şagirdlər yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Şagirdlər İdarəetməsi
        </Typography>
        <Typography variant="body1" color="text.secondary">
          👨‍🎓 Şagirdləri idarə edin və yenilərini əlavə edin
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
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
                placeholder="Şagird axtar (ad, email, ID, sinif)..."
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
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadStudents}
                sx={{ mr: 2 }}
              >
                Yenilə
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog('add')}
                size="large"
              >
                Yeni Şagird
              </Button>
            </Grid>
          </Grid>
          
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              📊 Toplam: {students.length} şagird • Aktiv: {students.filter(s => !s.isWithdrawn && !s.isSuspended).length} • 
              Çıxarılmış: {students.filter(s => s.isWithdrawn).length} • 
              Dayandırılmış: {students.filter(s => s.isSuspended).length}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Şagird</TableCell>
                <TableCell>Əlaqə</TableCell>
                <TableCell>Akademik Məlumat</TableCell>
                <TableCell>Valideyn</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.map((student) => (
                <TableRow key={student._id || student.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                        {student.name?.charAt(0)?.toUpperCase() || 'Ş'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {student.name || 'Adsız'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {student.studentId || student._id?.slice(-6) || 'N/A'}
                        </Typography>
                        {student.dateAdmitted && (
                          <Typography variant="caption" color="text.secondary">
                            Qəbul: {new Date(student.dateAdmitted).toLocaleDateString('az-AZ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{student.email || 'N/A'}</Typography>
                      </Box>
                      {student.phone && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{student.phone}</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {student.classLevel && (
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <SchoolIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {typeof student.classLevel === 'string' ? 
                              student.classLevel : 
                              student.classLevel?.name || 'N/A'
                            }
                          </Typography>
                        </Box>
                      )}
                      {student.program && (
                        <Typography variant="caption" color="text.secondary">
                          {typeof student.program === 'string' ? 
                            student.program : 
                            student.program?.name || 'N/A'
                          }
                        </Typography>
                      )}
                      <br />
                      {student.academicYear && (
                        <Typography variant="caption" color="text.secondary">
                          {typeof student.academicYear === 'string' ? 
                            student.academicYear : 
                            student.academicYear?.name || 'N/A'
                          }
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {student.parentName || 'N/A'}
                      </Typography>
                      {student.parentPhone && (
                        <Typography variant="caption" color="text.secondary">
                          📞 {student.parentPhone}
                        </Typography>
                      )}
                      {student.parentEmail && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ✉️ {student.parentEmail}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(student)}
                      color={getStatusColor(student)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Bax">
                      <IconButton onClick={() => handleOpenDialog('view', student)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzəliş et">
                      <IconButton onClick={() => handleOpenDialog('edit', student)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        onClick={() => {
                          setSelectedStudent(student);
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
              {paginatedStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir şagird tapılmadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredStudents.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Sətir sayı:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} / ${count !== -1 ? count : `${to}-dən çox`}`
          }
        />
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? '👨‍🎓 Yeni Şagird Əlavə Et' : 
           dialogMode === 'edit' ? '✏️ Şagirdi Düzəliş Et' : '👁️ Şagird Məlumatları'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Student Basic Info - API Documentation Parameters */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                👤 {dialogMode === 'add' ? 'Əsas Məlumatlar' : 'Şagird Məlumatları'}
              </Typography>
              {dialogMode === 'add' && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  ℹ️ API documentation-a uyğun olaraq yalnız əsas məlumatlar tələb olunur. 
                  Əlavə məlumatları sonradan düzəliş edə bilərsiniz.
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ad və Soyad *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            
            {dialogMode === 'add' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Şifrə *"
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
                    label="Şifrə Təkrarı *"
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    error={!!formErrors.passwordConfirm}
                    helperText={formErrors.passwordConfirm}
                  />
                </Grid>
              </>
            )}

            {/* Additional Info - Only for Edit/View Mode */}
            {dialogMode !== 'add' && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={!!formErrors.phone}
                    helperText={formErrors.phone}
                    disabled={dialogMode === 'view'}
                    placeholder="+994501234567"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Doğum Tarixi"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={dialogMode === 'view'}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth disabled={dialogMode === 'view'}>
                    <InputLabel>Cins</InputLabel>
                    <Select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      label="Cins"
                    >
                      <MenuItem value="">Seçin</MenuItem>
                      <MenuItem value="male">Kişi</MenuItem>
                      <MenuItem value="female">Qadın</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Academic Info - Only for Edit/View Mode */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    🎓 Akademik Məlumatlar
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth disabled={dialogMode === 'view'}>
                    <InputLabel>Sinif Səviyyəsi</InputLabel>
                    <Select
                      value={formData.classLevel}
                      onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                      label="Sinif Səviyyəsi"
                      error={!!formErrors.classLevel}
                    >
                      <MenuItem value="">Seçin</MenuItem>
                      {classLevels.map((level) => (
                        <MenuItem key={level._id || level.id} value={level._id || level.id}>
                          {level.name || level.level || level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {formErrors.classLevel && (
                    <Typography variant="caption" color="error">
                      {formErrors.classLevel}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth disabled={dialogMode === 'view'}>
                    <InputLabel>Proqram</InputLabel>
                    <Select
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      label="Proqram"
                    >
                      <MenuItem value="">Seçin</MenuItem>
                      {programs.map((program) => (
                        <MenuItem key={program._id || program.id} value={program._id || program.id}>
                          {program.name || program.title || program}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth disabled={dialogMode === 'view'}>
                    <InputLabel>Akademik İl</InputLabel>
                    <Select
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      label="Akademik İl"
                    >
                      <MenuItem value="">Seçin</MenuItem>
                      {academicYears.map((year) => (
                        <MenuItem key={year._id || year.id} value={year._id || year.id}>
                          {year.name || year.year || year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth disabled={dialogMode === 'view'}>
                    <InputLabel>Akademik Mövsüm</InputLabel>
                    <Select
                      value={formData.academicTerm}
                      onChange={(e) => setFormData({ ...formData, academicTerm: e.target.value })}
                      label="Akademik Mövsüm"
                    >
                      <MenuItem value="">Seçin</MenuItem>
                      {academicTerms.map((term) => (
                        <MenuItem key={term._id || term.id} value={term._id || term.id}>
                          {term.name || term.term || term}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Şagird ID"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    disabled={dialogMode === 'view'}
                    helperText="Sistem tərəfindən avtomatik yaradılır"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Qəbul Tarixi"
                    type="date"
                    value={formData.dateAdmitted}
                    onChange={(e) => setFormData({ ...formData, dateAdmitted: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    disabled={dialogMode === 'view'}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Məzun Olduğu İl"
                    type="number"
                    value={formData.yearGraduated}
                    onChange={(e) => setFormData({ ...formData, yearGraduated: e.target.value })}
                    disabled={dialogMode === 'view'}
                    inputProps={{ min: 2020, max: 2040 }}
                  />
                </Grid>

                {/* Parent Info - Only for Edit/View Mode */}
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                    👨‍👩‍👧‍👦 Valideyn Məlumatları
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Valideyn Adı"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    error={!!formErrors.parentName}
                    helperText={formErrors.parentName}
                    disabled={dialogMode === 'view'}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Valideyn Email"
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    error={!!formErrors.parentEmail}
                    helperText={formErrors.parentEmail}
                    disabled={dialogMode === 'view'}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Valideyn Telefon"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    error={!!formErrors.parentPhone}
                    helperText={formErrors.parentPhone}
                    disabled={dialogMode === 'view'}
                    placeholder="+994501234567"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ünvan"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    multiline
                    rows={2}
                    disabled={dialogMode === 'view'}
                    placeholder="Tam ünvan daxil edin..."
                  />
                </Grid>

                {/* Status Controls (only for edit mode) */}
                {dialogMode === 'edit' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>
                        ⚙️ Status İdarəetməsi
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isSuspended}
                            onChange={(e) => setFormData({ ...formData, isSuspended: e.target.checked })}
                          />
                        }
                        label="Müvəqqəti dayandırılıb"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.isWithdrawn}
                            onChange={(e) => setFormData({ ...formData, isWithdrawn: e.target.checked })}
                            color="error"
                          />
                        }
                        label="Sistemdən çıxarılıb"
                      />
                    </Grid>
                  </>
                )}
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
        <DialogTitle>⚠️ Şagirdi Sistemdən Çıxar</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>"{selectedStudent?.name}"</strong> adlı şagirdi sistemdən çıxarmaq istədiyinizdən əminsiniz?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Bu əməliyyat şagirdin statusunu "Çıxarılıb" olaraq dəyişəcək. Şagird hələ də sistemdə qalacaq, ancaq aktiv olmayacaq.
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
            {submitting ? <CircularProgress size={20} /> : 'Çıxar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsPage; 
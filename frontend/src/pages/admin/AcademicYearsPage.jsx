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
  CalendarMonth as CalendarIcon,
  Visibility as ViewIcon,
  DateRange as DateIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';

const API_BASE_URL = 'http://127.0.0.1:8000';

const AcademicYearsPage = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedYear, setSelectedYear] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Form states - Only API documentation fields
  const [formData, setFormData] = useState({
    name: '',
    fromYear: '',
    toYear: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/academic-years`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAcademicYears(data.academicYears || []);
        setError('');
      } else {
        setError('Akademik illər yüklənərkən xəta baş verdi');
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setError('Akademik illər yüklənərkən xəta baş verdi');
      setAcademicYears([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, year = null) => {
    setDialogMode(mode);
    setSelectedYear(year);
    if (year && mode !== 'add') {
      // Only use API documentation fields
      setFormData({
        name: year.name || '',
        fromYear: year.fromYear || '',
        toYear: year.toYear || ''
      });
    } else {
      setFormData({
        name: '',
        fromYear: '',
        toYear: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedYear(null);
    setFormData({
      name: '',
      fromYear: '',
      toYear: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Ad tələb olunur';
    if (!formData.fromYear) errors.fromYear = 'Başlanğıc ili tələb olunur';
    if (!formData.toYear) errors.toYear = 'Bitmə ili tələb olunur';
    
    const fromYear = parseInt(formData.fromYear);
    const toYear = parseInt(formData.toYear);
    
    if (fromYear >= toYear) {
      errors.toYear = 'Bitmə ili başlanğıc ildən böyük olmalıdır';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('adminToken');
      
      if (dialogMode === 'add') {
        const response = await fetch(`${API_BASE_URL}/academic-years`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Akademik il yaradılarkən xəta baş verdi');
        }
      } else if (dialogMode === 'edit' && selectedYear) {
        const response = await fetch(`${API_BASE_URL}/academic-years/${selectedYear._id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Akademik il yenilənərkən xəta baş verdi');
        }
      }
      
      await fetchAcademicYears();
      handleCloseDialog();
      setError('');
    } catch (error) {
      console.error('Error saving academic year:', error);
      setError(error.message || 'Akademik il saxlanılarkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedYear) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/academic-years/${selectedYear._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Akademik il silinərkən xəta baş verdi');
      }
      
      await fetchAcademicYears();
      setDeleteConfirmOpen(false);
      setSelectedYear(null);
      setError('');
    } catch (error) {
      console.error('Error deleting academic year:', error);
      setError('Akademik il silinərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredYears = academicYears.filter(year =>
    year.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    year.fromYear?.toString().includes(searchTerm) ||
    year.toYear?.toString().includes(searchTerm)
  );

  const paginatedYears = filteredYears.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (year) => {
    return year.isCurrent ? 'success' : 'default';
  };

  const getStatusText = (year) => {
    return year.isCurrent ? 'Cari il' : 'Deaktiv';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Akademik illər yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Akademik İllər
        </Typography>
        <Typography variant="body1" color="text.secondary">
          📅 Akademik illəri idarə edin və yenilərini əlavə edin
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
                placeholder="Akademik illər axtar..."
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
                Yeni Akademik İl
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Academic Years Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Akademik İl</TableCell>
                <TableCell>Başlanğıc İli</TableCell>
                <TableCell>Bitmə İli</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedYears.map((year) => (
                <TableRow key={year._id || year.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <CalendarIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {year.name || 'Adsız'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {year.fromYear}-{year.toYear}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <DateIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {year.fromYear || 'Təyin edilməyib'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <DateIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {year.toYear || 'Təyin edilməyib'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(year)}
                      color={getStatusColor(year)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Bax">
                      <IconButton onClick={() => handleOpenDialog('view', year)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzəliş et">
                      <IconButton onClick={() => handleOpenDialog('edit', year)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        onClick={() => {
                          setSelectedYear(year);
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
              {paginatedYears.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir akademik il tapılmadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredYears.length}
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
          {dialogMode === 'add' ? 'Yeni Akademik İl Əlavə Et' : 
           dialogMode === 'edit' ? 'Akademik İli Düzəliş Et' : 'Akademik İl Məlumatları'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Akademik İl Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={dialogMode === 'view'}
                placeholder="Məsələn: 2023-2024 Tədris İli"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Başlanğıc İli"
                type="number"
                value={formData.fromYear}
                onChange={(e) => setFormData({ ...formData, fromYear: e.target.value })}
                error={!!formErrors.fromYear}
                helperText={formErrors.fromYear}
                disabled={dialogMode === 'view'}
                InputProps={{
                  inputProps: { min: currentYear - 10, max: currentYear + 10 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bitmə İli"
                type="number"
                value={formData.toYear}
                onChange={(e) => setFormData({ ...formData, toYear: e.target.value })}
                error={!!formErrors.toYear}
                helperText={formErrors.toYear}
                disabled={dialogMode === 'view'}
                InputProps={{
                  inputProps: { min: currentYear - 10, max: currentYear + 10 }
                }}
              />
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
        <DialogTitle>Akademik İli Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedYear?.name}" adlı akademik ili silmək istədiyinizdən əminsiniz?
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

export default AcademicYearsPage; 
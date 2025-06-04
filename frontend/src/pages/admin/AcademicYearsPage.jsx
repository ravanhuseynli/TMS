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
  CalendarMonth as CalendarIcon,
  Visibility as ViewIcon,
  DateRange as DateIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

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
      const response = await adminAPI.getAcademicYears();
      setAcademicYears(response.data.academicYears || []);
      setError('');
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setError('Akademik illər yüklənərkən xəta baş verdi: ' + (error.response?.data?.message || error.message));
      setAcademicYears([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, year = null) => {
    setDialogMode(mode);
    setSelectedYear(year);
    if (year && mode !== 'add') {
      // Only use API documentation fields, convert years to strings for form display
      setFormData({
        name: year.name || '',
        fromYear: year.fromYear ? year.fromYear.toString() : '',
        toYear: year.toYear ? year.toYear.toString() : ''
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
    
    // Validate year range
    if (formData.fromYear && (fromYear < 1900 || fromYear > 2100)) {
      errors.fromYear = 'Başlanğıc ili 1900-2100 aralığında olmalıdır';
    }
    
    if (formData.toYear && (toYear < 1900 || toYear > 2100)) {
      errors.toYear = 'Bitmə ili 1900-2100 aralığında olmalıdır';
    }
    
    if (fromYear && toYear && fromYear >= toYear) {
      errors.toYear = 'Bitmə ili başlanğıc ildən böyük olmalıdır';
    }
    
    // Validate that years are integers
    if (formData.fromYear && isNaN(fromYear)) {
      errors.fromYear = 'Başlanğıc ili düzgün rəqəm olmalıdır';
    }
    
    if (formData.toYear && isNaN(toYear)) {
      errors.toYear = 'Bitmə ili düzgün rəqəm olmalıdır';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      // Convert year values to numbers
      const submitData = {
        name: formData.name,
        fromYear: parseInt(formData.fromYear),
        toYear: parseInt(formData.toYear)
      };
      
      if (dialogMode === 'add') {
        await adminAPI.createAcademicYear(submitData);
      } else if (dialogMode === 'edit' && selectedYear) {
        await adminAPI.updateAcademicYear(selectedYear._id, submitData);
      }
      
      await fetchAcademicYears();
      handleCloseDialog();
      setError('');
    } catch (error) {
      console.error('Error saving academic year:', error);
      setError(error.response?.data?.message || 'Akademik il saxlanılarkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedYear) return;

    try {
      setSubmitting(true);
      await adminAPI.deleteAcademicYear(selectedYear._id);
      
      await fetchAcademicYears();
      setDeleteConfirmOpen(false);
      setSelectedYear(null);
      setError('');
    } catch (error) {
      console.error('Error deleting academic year:', error);
      setError(error.response?.data?.message || 'Akademik il silinərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter academic years based on search
  const filteredYears = academicYears.filter(year =>
    year.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    year.fromYear?.toString().includes(searchTerm) ||
    year.toYear?.toString().includes(searchTerm)
  );

  // Pagination
  const paginatedYears = filteredYears.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
              >
                Yeni Akademik İl
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ad</TableCell>
                <TableCell>Başlanğıc İli</TableCell>
                <TableCell>Bitmə İli</TableCell>
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
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Akademik İl Adı"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  disabled={dialogMode === 'view'}
                  placeholder="Məs: 2023-2024 Akademik İl"
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
                  placeholder="Məs: 2023"
                  inputProps={{ min: 1900, max: 2100 }}
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
                  placeholder="Məs: 2024"
                  inputProps={{ min: 1900, max: 2100 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            İmtina
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 
               dialogMode === 'add' ? 'Əlavə Et' : 'Yadda Saxla'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Akademik İli Sil</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedYear?.name} adlı akademik ili silmək istədiyinizə əminsiniz?
            Bu əməliyyat geri qaytarıla bilməz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            İmtina
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
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
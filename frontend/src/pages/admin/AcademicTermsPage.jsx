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
  Event as EventIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const AcademicTermsPage = () => {
  const [academicTerms, setAcademicTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Form states - Only API documentation fields
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAcademicTerms();
  }, []);

  const fetchAcademicTerms = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAcademicTerms();
      setAcademicTerms(response.data.academicTerms || []);
      setError('');
    } catch (error) {
      console.error('Error fetching academic terms:', error);
      setError('Akademik mövsümlər yüklənərkən xəta baş verdi: ' + (error.response?.data?.message || error.message));
      setAcademicTerms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, term = null) => {
    setDialogMode(mode);
    setSelectedTerm(term);
    if (term && mode !== 'add') {
      // Only use API documentation fields
      setFormData({
        name: term.name || '',
        description: term.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTerm(null);
    setFormData({
      name: '',
      description: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Mövsüm adı tələb olunur';
    if (!formData.description.trim()) errors.description = 'Təsvir tələb olunur';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      if (dialogMode === 'add') {
        await adminAPI.createAcademicTerm(formData);
      } else if (dialogMode === 'edit' && selectedTerm) {
        await adminAPI.updateAcademicTerm(selectedTerm._id, formData);
      }
      
      await fetchAcademicTerms();
      handleCloseDialog();
      setError('');
    } catch (error) {
      console.error('Error saving academic term:', error);
      setError(error.response?.data?.message || 'Akademik mövsüm saxlanılarkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTerm) return;

    try {
      setSubmitting(true);
      await adminAPI.deleteAcademicTerm(selectedTerm._id);
      
      await fetchAcademicTerms();
      setDeleteConfirmOpen(false);
      setSelectedTerm(null);
      setError('');
    } catch (error) {
      console.error('Error deleting academic term:', error);
      setError(error.response?.data?.message || 'Akademik mövsüm silinərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTerms = academicTerms.filter(term =>
    term.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedTerms = filteredTerms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (term) => {
    return term.isActive ? 'success' : 'default';
  };

  const getStatusText = (term) => {
    return term.isActive ? 'Aktiv' : 'Deaktiv';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Akademik mövsümlər yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Akademik Mövsümlər
        </Typography>
        <Typography variant="body1" color="text.secondary">
          📚 Akademik mövsümləri idarə edin və yenilərini əlavə edin
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
                placeholder="Akademik mövsümlər axtar..."
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
                Yeni Akademik Mövsüm
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Academic Terms Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mövsüm</TableCell>
                <TableCell>Təsvir</TableCell>
                <TableCell>Fənlər</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTerms.map((term) => (
                <TableRow key={term._id || term.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <EventIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {term.name || 'Adsız'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {term.termType || 'Mövsüm növü təyin edilməyib'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {term.description || 'Təsvir yoxdur'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {term.subjects?.length || 0} fənn
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(term)}
                      color={getStatusColor(term)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Bax">
                      <IconButton onClick={() => handleOpenDialog('view', term)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzəliş et">
                      <IconButton onClick={() => handleOpenDialog('edit', term)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        onClick={() => {
                          setSelectedTerm(term);
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
              {paginatedTerms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir akademik mövsüm tapılmadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredTerms.length}
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
          {dialogMode === 'add' ? 'Yeni Akademik Mövsüm Əlavə Et' : 
           dialogMode === 'edit' ? 'Akademik Mövsümü Düzəliş Et' : 'Akademik Mövsüm Məlumatları'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mövsüm Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={dialogMode === 'view'}
                placeholder="Məsələn: 1-ci Yarıil"
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
                placeholder="Mövsüm haqqında əlavə məlumat..."
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
        <DialogTitle>Akademik Mövsümü Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedTerm?.name}" adlı akademik mövsümü silmək istədiyinizdən əminsiniz?
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

export default AcademicTermsPage; 
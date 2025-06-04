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
  School as SchoolIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const ClassLevelsPage = () => {
  const [classLevels, setClassLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Form states - Only API documentation fields
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClassLevels();
  }, []);

  const fetchClassLevels = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getClassLevels();
      setClassLevels(response.data.classes || []);
      setError('');
    } catch (error) {
      console.error('Error fetching class levels:', error);
      setError('Sinif səviyyələri yüklənərkən xəta baş verdi: ' + (error.response?.data?.message || error.message));
      setClassLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, level = null) => {
    setDialogMode(mode);
    setSelectedLevel(level);
    if (level && mode !== 'add') {
      // Only use API documentation fields
      setFormData({
        name: level.name || '',
        description: level.description || ''
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
    setSelectedLevel(null);
    setFormData({
      name: '',
      description: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Sinif səviyyəsi adı tələb olunur';
    if (!formData.description.trim()) errors.description = 'Təsvir tələb olunur';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      if (dialogMode === 'add') {
        await adminAPI.createClassLevel(formData);
      } else if (dialogMode === 'edit' && selectedLevel) {
        await adminAPI.updateClassLevel(selectedLevel._id, formData);
      }
      
      await fetchClassLevels();
      handleCloseDialog();
      setError('');
    } catch (error) {
      console.error('Error saving class level:', error);
      setError(error.response?.data?.message || 'Sinif səviyyəsi saxlanılarkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLevel) return;

    try {
      setSubmitting(true);
      await adminAPI.deleteClassLevel(selectedLevel._id);
      
      await fetchClassLevels();
      setDeleteConfirmOpen(false);
      setSelectedLevel(null);
      setError('');
    } catch (error) {
      console.error('Error deleting class level:', error);
      setError(error.response?.data?.message || 'Sinif səviyyəsi silinərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLevels = classLevels.filter(level =>
    level.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedLevels = filteredLevels.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (level) => {
    return level.isActive ? 'success' : 'default';
  };

  const getStatusText = (level) => {
    return level.isActive ? 'Aktiv' : 'Deaktiv';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Sinif səviyyələri yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Sinif Səviyyələri
        </Typography>
        <Typography variant="body1" color="text.secondary">
          🎓 Sinif səviyyələrini idarə edin və yenilərini əlavə edin
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
                placeholder="Sinif səviyyələri axtar..."
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
                Yeni Sinif Səviyyəsi
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Class Levels Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sinif Səviyyəsi</TableCell>
                <TableCell>Təsvir</TableCell>
                <TableCell>Şagirdlər</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedLevels.map((level) => (
                <TableRow key={level._id || level.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <SchoolIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {level.name || 'Adsız'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {level.grade || 'Səviyyə təyin edilməyib'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {level.description || 'Təsvir yoxdur'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {level.students?.length || 0} şagird
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(level)}
                      color={getStatusColor(level)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Bax">
                      <IconButton onClick={() => handleOpenDialog('view', level)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzəliş et">
                      <IconButton onClick={() => handleOpenDialog('edit', level)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        onClick={() => {
                          setSelectedLevel(level);
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
              {paginatedLevels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir sinif səviyyəsi tapılmadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredLevels.length}
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
          {dialogMode === 'add' ? 'Yeni Sinif Səviyyəsi Əlavə Et' : 
           dialogMode === 'edit' ? 'Sinif Səviyyəsini Düzəliş Et' : 'Sinif Səviyyəsi Məlumatları'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Sinif Səviyyəsi Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={dialogMode === 'view'}
                placeholder="Məsələn: 1-ci sinif"
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
                placeholder="Sinif səviyyəsi haqqında əlavə məlumat..."
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
        <DialogTitle>Sinif Səviyyəsini Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedLevel?.name}" adlı sinif səviyyəsini silmək istədiyinizdən əminsiniz?
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

export default ClassLevelsPage; 
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
  Code as CodeIcon,
  Visibility as ViewIcon,
  Assignment as ProgramIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { adminAPI } from '../../services/api';

const ProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Form states - Only API documentation fields
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPrograms();
      setPrograms(response.data.programs || []);
      setError('');
    } catch (error) {
      console.error('Error fetching programs:', error);
      setError('Proqramlar yüklənərkən xəta baş verdi: ' + (error.response?.data?.message || error.message));
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, program = null) => {
    setDialogMode(mode);
    setSelectedProgram(program);
    if (program && mode !== 'add') {
      // Only use API documentation fields
      setFormData({
        name: program.name || '',
        description: program.description || ''
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
    setSelectedProgram(null);
    setFormData({
      name: '',
      description: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Proqram adı tələb olunur';
    if (!formData.description.trim()) errors.description = 'Təsvir tələb olunur';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      if (dialogMode === 'add') {
        await adminAPI.createProgram(formData);
      } else if (dialogMode === 'edit' && selectedProgram) {
        await adminAPI.updateProgram(selectedProgram._id, formData);
      }
      
      await fetchPrograms();
      handleCloseDialog();
      setError('');
    } catch (error) {
      console.error('Error saving program:', error);
      setError(error.response?.data?.message || 'Proqram saxlanılarkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProgram) return;

    try {
      setSubmitting(true);
      await adminAPI.deleteProgram(selectedProgram._id);
      
      await fetchPrograms();
      setDeleteConfirmOpen(false);
      setSelectedProgram(null);
      setError('');
    } catch (error) {
      console.error('Error deleting program:', error);
      setError(error.response?.data?.message || 'Proqram silinərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedPrograms = filteredPrograms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (program) => {
    return program.isActive ? 'success' : 'default';
  };

  const getStatusText = (program) => {
    return program.isActive ? 'Aktiv' : 'Deaktiv';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Proqramlar yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Proqramlar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          💻 Təhsil proqramlarını idarə edin və yenilərini əlavə edin
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
                placeholder="Proqramlar axtar..."
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
                Yeni Proqram
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Programs Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proqram</TableCell>
                <TableCell>Təsvir</TableCell>
                <TableCell>Fənlər</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPrograms.map((program) => (
                <TableRow key={program._id || program.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ProgramIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {program.name || 'Adsız'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {program.code || 'Kod təyin edilməyib'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {program.description || 'Təsvir yoxdur'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {program.subjects?.length || 0} fənn
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(program)}
                      color={getStatusColor(program)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Bax">
                      <IconButton onClick={() => handleOpenDialog('view', program)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzəliş et">
                      <IconButton onClick={() => handleOpenDialog('edit', program)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        onClick={() => {
                          setSelectedProgram(program);
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
              {paginatedPrograms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir proqram tapılmadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredPrograms.length}
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
          {dialogMode === 'add' ? 'Yeni Proqram Əlavə Et' : 
           dialogMode === 'edit' ? 'Proqramı Düzəliş Et' : 'Proqram Məlumatları'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Proqram Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={dialogMode === 'view'}
                placeholder="Məsələn: Kompüter Mühəndisliyi"
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
                placeholder="Proqram haqqında əlavə məlumat..."
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
        <DialogTitle>Proqramı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedProgram?.name}" adlı proqramı silmək istədiyinizdən əminsiniz?
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

export default ProgramsPage; 
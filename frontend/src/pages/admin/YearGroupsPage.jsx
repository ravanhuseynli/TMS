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
  Groups as GroupIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  Class as ClassIcon,
} from '@mui/icons-material';

const API_BASE_URL = 'http://127.0.0.1:8000';

const YearGroupsPage = () => {
  const [yearGroups, setYearGroups] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Form states - Only API documentation fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    academicYear: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadYearGroups();
    loadAcademicYears();
  }, []);

  const loadYearGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/year-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setYearGroups(data.yearGroups || []);
        setError('');
      } else {
        setError('İl qrupları yüklənərkən xəta baş verdi');
      }
    } catch (error) {
      console.error('Error loading year groups:', error);
      setError('İl qrupları yüklənərkən xəta baş verdi');
      setYearGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAcademicYears = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Error loading academic years:', error);
    }
  };

  const handleOpenDialog = (mode, group = null) => {
    setDialogMode(mode);
    setSelectedGroup(group);
    if (group && mode !== 'add') {
      // Only use API documentation fields
      setFormData({
        name: group.name || '',
        description: group.description || '',
        academicYear: group.academicYear?._id || group.academicYear || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        academicYear: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGroup(null);
    setFormData({
      name: '',
      description: '',
      academicYear: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'İl qrupu adı tələb olunur';
    if (!formData.description.trim()) errors.description = 'Təsvir tələb olunur';
    if (!formData.academicYear.trim()) errors.academicYear = 'Akademik il tələb olunur';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('adminToken');
      
      if (dialogMode === 'add') {
        const response = await fetch(`${API_BASE_URL}/year-groups`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'İl qrupu yaradılarkən xəta baş verdi');
        }
      } else if (dialogMode === 'edit' && selectedGroup) {
        const response = await fetch(`${API_BASE_URL}/year-groups/${selectedGroup._id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'İl qrupu yenilənərkən xəta baş verdi');
        }
      }
      
      await loadYearGroups();
      handleCloseDialog();
      setError('');
    } catch (error) {
      console.error('Error saving year group:', error);
      setError(error.message || 'İl qrupu saxlanılarkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/year-groups/${selectedGroup._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'İl qrupu silinərkən xəta baş verdi');
      }
      
      await loadYearGroups();
      setDeleteConfirmOpen(false);
      setSelectedGroup(null);
      setError('');
    } catch (error) {
      console.error('Error deleting year group:', error);
      setError('İl qrupu silinərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredYearGroups = yearGroups.filter(group =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.academicYear?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedYearGroups = filteredYearGroups.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (group) => {
    return group.isActive ? 'success' : 'default';
  };

  const getStatusText = (group) => {
    return group.isActive ? 'Aktiv' : 'Deaktiv';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          İl qrupları yüklənir...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          İl Qrupları
        </Typography>
        <Typography variant="body1" color="text.secondary">
          👥 İl qruplarını idarə edin və yenilərini əlavə edin
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
                placeholder="İl qrupları axtar..."
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
                Yeni İl Qrupu
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Year Groups Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Qrup</TableCell>
                <TableCell>Təsvir</TableCell>
                <TableCell>Akademik İl</TableCell>
                <TableCell>Şagirdlər</TableCell>
                <TableCell align="center">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedYearGroups.map((group) => (
                <TableRow key={group._id || group.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <GroupIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {group.name || 'Adsız'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.yearGroup || 'İl təyin edilməyib'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {group.description || 'Təsvir yoxdur'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {group.academicYear?.name || 'Təyin edilməyib'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {group.students?.length || 0} şagird
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Bax">
                      <IconButton onClick={() => handleOpenDialog('view', group)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzəliş et">
                      <IconButton onClick={() => handleOpenDialog('edit', group)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton 
                        onClick={() => {
                          setSelectedGroup(group);
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
              {paginatedYearGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm ? 'Axtarış nəticəsi tapılmadı' : 'Heç bir il qrupu tapılmadı'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredYearGroups.length}
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
          {dialogMode === 'add' ? 'Yeni İl Qrupu Əlavə Et' : 
           dialogMode === 'edit' ? 'İl Qrupunu Düzəliş Et' : 'İl Qrupu Məlumatları'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Qrup Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={dialogMode === 'view'}
                placeholder="Məsələn: 2023 İl Qrupu"
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
                placeholder="Qrup haqqında əlavə məlumat..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.academicYear}>
                <InputLabel>Akademik İl</InputLabel>
                <Select
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  disabled={dialogMode === 'view'}
                  label="Akademik İl"
                >
                  <MenuItem value="">
                    <em>Akademik il seçin</em>
                  </MenuItem>
                  {academicYears.map((year) => (
                    <MenuItem key={year._id || year.id} value={year._id || year.id}>
                      {year.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.academicYear && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {formErrors.academicYear}
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
        <DialogTitle>İl Qrupunu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            "{selectedGroup?.name}" adlı il qrupunu silmək istədiyinizdən əminsiniz?
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

export default YearGroupsPage; 
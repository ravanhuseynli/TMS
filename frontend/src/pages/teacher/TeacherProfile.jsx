import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CalendarMonth as CalendarIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { teacherAPI } from '../../services/api';

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    dateOfBirth: '',
    phone: '',
    address: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await teacherAPI.getProfile();
      const profileData = response.data?.teacher || response.data?.data || response.data;
      
      setProfile(profileData);
      setFormData({
        name: profileData?.name || '',
        email: profileData?.email || '',
        employeeId: profileData?.employeeId || '',
        dateOfBirth: profileData?.dateOfBirth?.split('T')[0] || '',
        phone: profileData?.phone || '',
        address: profileData?.address || ''
      });

    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Profil yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset form data to original profile data
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      employeeId: profile?.employeeId || '',
      dateOfBirth: profile?.dateOfBirth?.split('T')[0] || '',
      phone: profile?.phone || '',
      address: profile?.address || ''
    });
  };

  const handleSave = async () => {
    try {
      setUpdateLoading(true);
      
      await teacherAPI.updateProfile(profile._id, formData);
      await loadProfile(); // Reload profile data
      setEditMode(false);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Profil yenilənərkən xəta baş verdi');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Məlumat yoxdur';
    try {
      return new Date(dateString).toLocaleDateString('az-AZ');
    } catch (error) {
      return dateString;
    }
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

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadProfile}>
          Yenidən Yüklə
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Müəllim Profili
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Şəxsi məlumatlarınızı görüntüləyin və redaktə edin
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {profile?.name?.charAt(0)?.toUpperCase() || 'M'}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {profile?.name || 'Müəllim'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile?.email || 'Email mövcud deyil'}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Chip
                  label="Müəllim"
                  color="primary"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <br />
                {profile?.isActive ? (
                  <Chip label="Aktiv" color="success" size="small" />
                ) : (
                  <Chip label="Qeyri-aktiv" color="error" size="small" />
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                {!editMode ? (
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    fullWidth
                  >
                    Profil Redaktə Et
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={updateLoading}
                      size="small"
                    >
                      Saxla
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={updateLoading}
                      size="small"
                    >
                      Ləğv et
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Şəxsi Məlumatlar
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Ad və Soyad
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">
                        {profile?.name || 'Məlumat yoxdur'}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Email
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        variant="outlined"
                        size="small"
                        type="email"
                      />
                    ) : (
                      <Typography variant="body1">
                        {profile?.email || 'Məlumat yoxdur'}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      İşçi ID
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        value={formData.employeeId}
                        onChange={(e) => handleInputChange('employeeId', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">
                        {profile?.employeeId || 'Məlumat yoxdur'}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Doğum Tarixi
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : (
                      <Typography variant="body1">
                        {formatDate(profile?.dateOfBirth)}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Telefon
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">
                        {profile?.phone || 'Məlumat yoxdur'}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Qeydiyyat Tarixi
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(profile?.dateEmployed || profile?.createdAt)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Ünvan
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">
                        {profile?.address || 'Məlumat yoxdur'}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Info */}
          {profile?.program && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Proqram Məlumatları
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" alignItems="center" gap={1}>
                  <SchoolIcon color="primary" />
                  <Typography variant="body1">
                    {profile.program?.name || 'Proqram təyin edilməyib'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default TeacherProfile; 
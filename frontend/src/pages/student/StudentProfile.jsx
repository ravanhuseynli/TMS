import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { studentAPI } from '../../services/api';

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    classLevel: '',
    program: '',
    academicYear: '',
    dateOfBirth: '',
    isWithdrawn: false,
    isSuspended: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadStudentProfile();
  }, []);

  const loadStudentProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentAPI.getProfile();
      const student = response.data?.student || response.data?.data;
      
      setStudentData(student);
      setFormData({
        name: student?.name || '',
        email: student?.email || '',
        studentId: student?.studentId || '',
        classLevel: student?.classLevel?.name || '',
        program: student?.program?.name || '',
        academicYear: student?.academicYear?.name || '',
        dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        isWithdrawn: student?.isWithdrawn || false,
        isSuspended: student?.isSuspended || false
      });
      
    } catch (err) {
      console.error('Error loading student profile:', err);
      setError(err.response?.data?.message || 'Profil yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Ad tələb olunur';
    if (!formData.email.trim()) errors.email = 'Email tələb olunur';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Düzgün email formatı daxil edin';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) errors.currentPassword = 'Hazırkı parol tələb olunur';
    if (!passwordData.newPassword) errors.newPassword = 'Yeni parol tələb olunur';
    if (passwordData.newPassword && passwordData.newPassword.length < 6) {
      errors.newPassword = 'Parol ən azı 6 simvol olmalıdır';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Parollar uyğun gəlmir';
    }
    
    return errors;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const updateData = {
        name: formData.name,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth
      };
      
      await studentAPI.updateProfile(studentData._id, updateData);
      
      setSuccess('Profil uğurla yeniləndi');
      setIsEditing(false);
      loadStudentProfile();
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Profil yenilənərkən xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await studentAPI.updateMyPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        passwordConfirm: passwordData.confirmPassword
      });
      
      setSuccess('Parol uğurla dəyişdirildi');
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Parol dəyişdirilərkən xəta baş verdi');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: studentData?.name || '',
      email: studentData?.email || '',
      studentId: studentData?.studentId || '',
      classLevel: studentData?.classLevel?.name || '',
      program: studentData?.program?.name || '',
      academicYear: studentData?.academicYear?.name || '',
      dateOfBirth: studentData?.dateOfBirth ? studentData.dateOfBirth.split('T')[0] : '',
      isWithdrawn: studentData?.isWithdrawn || false,
      isSuspended: studentData?.isSuspended || false
    });
    setValidationErrors({});
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tələbə Profili
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Profil məlumatlarınızı idarə edin
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  Profil Məlumatları
                </Typography>
                <Button
                  variant={isEditing ? "outlined" : "contained"}
                  startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                  onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  disabled={saving}
                >
                  {isEditing ? 'Saxla' : 'Redaktə et'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ad"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!validationErrors.email}
                    helperText={validationErrors.email}
                    disabled={!isEditing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tələbə ID"
                    value={formData.studentId}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Doğum Tarixi"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sinif Səviyyəsi"
                    value={formData.classLevel}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Proqram"
                    value={formData.program}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Akademik İl"
                    value={formData.academicYear}
                    disabled
                  />
                </Grid>
              </Grid>

              {isEditing && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? 'Saxlanır...' : 'Saxla'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    İmtina et
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Picture and Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}>
                  <AccountCircleIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {studentData?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {studentData?.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Hesab Təhlükəsizliyi
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LockIcon />}
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{ mb: 2 }}
                >
                  Parolu Dəyişdir
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Hesab Statusu
                </Typography>
                <FormControlLabel
                  control={<Switch checked={!formData.isWithdrawn} />}
                  label={formData.isWithdrawn ? "Çıxarılmış" : "Aktiv"}
                  disabled
                />
                <FormControlLabel
                  control={<Switch checked={formData.isSuspended} />}
                  label={formData.isSuspended ? "Dayandırılmış" : "Normal"}
                  disabled
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Parolu Dəyişdir</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Hazırkı Parol"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              error={!!validationErrors.currentPassword}
              helperText={validationErrors.currentPassword}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Yeni Parol"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              error={!!validationErrors.newPassword}
              helperText={validationErrors.newPassword}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Yeni Parolu Təkrarla"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} disabled={saving}>
            İmtina et
          </Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={saving}>
            {saving ? 'Saxlanır...' : 'Dəyişdir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentProfile;

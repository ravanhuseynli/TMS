import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Chip,
  Container,
  Avatar,
  CircularProgress,
  Paper,
  Grid,
} from '@mui/material';
import {
  AdminPanelSettings,
  School,
  Person,
  Email,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userTypes = [
    {
      value: 'admin',
      label: 'İdarəçi',
      icon: <AdminPanelSettings />,
      color: 'error',
      description: 'Sistem idarəetməsi'
    },
    {
      value: 'teacher',
      label: 'Müəllim',
      icon: <School />,
      color: 'primary',
      description: 'İmtahan və sual idarəsi'
    },
    {
      value: 'student',
      label: 'Şagird',
      icon: <Person />,
      color: 'success',
      description: 'İmtahan verə bilər'
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleUserTypeSelect = (userType) => {
    setFormData({
      ...formData,
      userType
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userType) {
      setError('Zəhmət olmasa istifadəçi növünü seçin');
      return;
    }

    if (!formData.email || !formData.password) {
      setError('Bütün sahələri doldurun');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password, formData.userType);
      
      if (result.success) {
        const from = location.state?.from?.pathname;
        const redirectPath = from || getDefaultRoute(result.user.role);
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.error || 'Giriş uğursuz oldu');
      }
    } catch (error) {
      setError('Sistemdə xəta baş verdi');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultRoute = (role) => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            maxWidth: 480,
            mx: 'auto',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                }}
              >
                🏫
              </Avatar>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Məktəb İdarəetmə Sistemi
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Hesabınıza daxil olun
              </Typography>
            </Box>

            {/* User Type Selection */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                İstifadəçi növü seçin
              </Typography>
              <Grid container spacing={2}>
                {userTypes.map((type) => (
                  <Grid item xs={12} sm={4} key={type.value}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        border: 2,
                        borderColor: formData.userType === type.value ? `${type.color}.main` : 'transparent',
                        backgroundColor: formData.userType === type.value ? `${type.color}.50` : 'background.paper',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleUserTypeSelect(type.value)}
                    >
                      <Avatar
                        sx={{
                          mx: 'auto',
                          mb: 1,
                          bgcolor: `${type.color}.main`,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {type.icon}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {type.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="E-poçt ünvanı"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <Email sx={{ color: 'text.secondary', mr: 1 }} />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Şifrə"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <Lock sx={{ color: 'text.secondary', mr: 1 }} />
                  ),
                }}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Daxil ol'
                )}
              </Button>

              {/* Selected User Type Display */}
              {formData.userType && (
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Seçilmiş istifadəçi növü:
                  </Typography>
                  <Chip
                    label={userTypes.find(t => t.value === formData.userType)?.label}
                    color={userTypes.find(t => t.value === formData.userType)?.color}
                    icon={userTypes.find(t => t.value === formData.userType)?.icon}
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box textAlign="center" mt={3}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © 2024 Məktəb İdarəetmə Sistemi. Bütün hüquqlar qorunur.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage; 
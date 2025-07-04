import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const TeacherProfile = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Müəllim Profili
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Profil məlumatları səhifəsi
        </Typography>
      </Box>
    </Container>
  );
};

export default TeacherProfile; 
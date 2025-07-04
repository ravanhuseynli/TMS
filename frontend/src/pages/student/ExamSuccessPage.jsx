import React from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const ExamSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const examData = location.state || {};
  const { examName, questionsCount, answeredCount } = examData;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom color="success.main">
            İmtahan Uğurla Təslim Edildi!
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            {examName || 'İmtahan'} uğurla təslim edildi
          </Typography>

          {questionsCount && (
            <Box sx={{ my: 3 }}>
              <Typography variant="body1" color="text.secondary">
                <strong>Ümumi suallar:</strong> {questionsCount}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Cavablanmış suallar:</strong> {answeredCount || 0}
              </Typography>
            </Box>
          )}

          <Alert severity="info" sx={{ my: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Qeyd:</strong> İmtahan nəticəniz müəlliminiz tərəfindən qiymətləndirilir. 
              Nəticələr hazır olduqda "İmtahan Nəticələri" bölməsindən baxa bilərsiniz.
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/student/dashboard')}
              size="large"
            >
              Dashboard-a Qayıt
            </Button>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => navigate('/student/results')}
              size="large"
            >
              Nəticələri Gör
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ExamSuccessPage;

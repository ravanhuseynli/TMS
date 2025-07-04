import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          p={3}
          bgcolor="background.default"
        >
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Xəta baş verdi!
            </Typography>
            <Typography variant="body2" paragraph>
              {this.state.error && this.state.error.toString()}
            </Typography>
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '16px' }}>
              <summary>Ətraflı məlumat</summary>
              {this.state.errorInfo.componentStack}
            </details>
          </Alert>
          
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
          >
            Səhifəni yenilə
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
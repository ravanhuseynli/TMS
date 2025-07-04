import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Container,
  Breadcrumbs,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  School,
  CalendarMonth,
  DateRange,
  Layers,
  LibraryBooks,
  Book,
  Groups,
  Quiz,
  HelpOutline,
  AccountCircle,
  Logout,
  Assignment,
  Analytics,
  Home,
  AssessmentOutlined,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const { user, logout, isAdmin, isTeacher, isStudent, getRoleDisplayName, getUserInitials } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  const getNavigationItems = () => {
    if (isAdmin()) {
      return [
        { path: '/admin/dashboard', label: 'İdarə Paneli', icon: <Dashboard /> },
        { path: '/admin/teachers', label: 'Müəllimlər', icon: <People /> },
        { path: '/admin/students', label: 'Şagirdlər', icon: <School /> },
        { path: '/admin/academic-years', label: 'Tədris İlləri', icon: <CalendarMonth /> },
        { path: '/admin/academic-terms', label: 'Akademik Mövsümlər', icon: <DateRange /> },
        { path: '/admin/class-levels', label: 'Sinif Səviyyələri', icon: <Layers /> },
        { path: '/admin/programs', label: 'Proqramlar', icon: <LibraryBooks /> },
        { path: '/admin/subjects', label: 'Fənlər', icon: <Book /> },
        { path: '/admin/year-groups', label: 'İl Qrupları', icon: <Groups /> },
        { path: '/admin/exams', label: 'İmtahanlar', icon: <Assignment /> },
        { path: '/admin/questions', label: 'Suallar', icon: <Quiz /> },
        { path: '/admin/exam-results', label: 'İmtahan Nəticələri', icon: <AssessmentOutlined /> },
      ];
    } else if (isTeacher()) {
      return [
        { path: '/teacher/dashboard', label: 'İdarə Paneli', icon: <Dashboard /> },
        { path: '/teacher/exams', label: 'İmtahanlar', icon: <Assignment /> },
        { path: '/teacher/questions', label: 'Suallar', icon: <Quiz /> },
        { path: '/teacher/subjects', label: 'Fənlər', icon: <Book /> },
        { path: '/teacher/profile', label: 'Profil', icon: <AccountCircle /> },
      ];
    } else if (isStudent()) {
      return [
        { path: '/student/dashboard', label: 'İdarə Paneli', icon: <Dashboard /> },
        { path: '/student/exams', label: 'İmtahanlar', icon: <Assignment /> },
        { path: '/student/results', label: 'Nəticələr', icon: <Analytics /> },
        { path: '/student/profile', label: 'Profil', icon: <AccountCircle /> },
        { path: '/help', label: 'Kömək', icon: <HelpOutline /> },
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  const getRoleColor = () => {
    if (isAdmin()) return 'error';
    if (isTeacher()) return 'primary';
    if (isStudent()) return 'success';
    return 'default';
  };

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'Səhifə';
  };

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const item = navigationItems.find(item => item.path === routeTo);
      
      return {
        label: item?.label || name,
        path: routeTo,
        isLast
      };
    });
  };

  const drawer = (
    <Box>
      {/* Sidebar Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 48,
              height: 48,
              fontSize: '1.2rem'
            }}
          >
            {getUserInitials()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
              {user?.name || user?.email || 'İstifadəçi'}
            </Typography>
            <Chip 
              label={getRoleDisplayName()} 
              size="small" 
              color={getRoleColor()}
              sx={{ fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 1, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              color: 'white',
              '&.Mui-selected': {
                backgroundColor: 'rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.4)',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      {/* Sidebar Footer */}
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: 16, 
          left: 16, 
          right: 16,
          p: 2,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
          💡 Məsləhət
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Mobil versiyada menyunu açmaq üçün ☰ düyməsini basın
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box display="flex" alignItems="center" gap={2} flexGrow={1}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              🏫 Məktəb İdarəetmə Sistemi
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Xoş gəlmisiniz, {user?.name || user?.email}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {getUserInitials()}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          Profil
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          Çıxış
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Breadcrumbs */}
          <Box mb={3}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Home fontSize="small" />
                  Ana səhifə
                </Box>
              </Link>
              {getBreadcrumbs().map((crumb, index) => (
                crumb.isLast ? (
                  <Typography key={index} color="primary" fontWeight={600}>
                    {crumb.label}
                  </Typography>
                ) : (
                  <Link 
                    key={index} 
                    to={crumb.path}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {crumb.label}
                  </Link>
                )
              ))}
            </Breadcrumbs>
          </Box>

          {/* Page content */}
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, adminAPI, teacherAPI, studentAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('AuthContext initializing...');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Found stored user:', parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('No stored authentication found');
    }
    setLoading(false);
  }, []);

  const login = async (email, password, userType) => {
    try {
      setLoading(true);
      let response;
      
      // Use appropriate login endpoint based on user type
      switch (userType) {
        case 'admin':
          response = await authAPI.adminLogin(email, password);
          break;
        case 'teacher':
          response = await authAPI.teacherLogin(email, password);
          break;
        case 'student':
          response = await authAPI.studentLogin(email, password);
          break;
        default:
          throw new Error('Naməlum istifadəçi növü');
      }
      
      if (response.data && response.data.token) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error('Yanlış cavab formatı');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Giriş uğursuz oldu' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (userData) => {
    try {
      let response;
      
      // Use appropriate update endpoint based on user role
      if (isAdmin()) {
        response = await adminAPI.updateAdmin(userData);
      } else if (isTeacher()) {
        response = await teacherAPI.updateProfile(user.id, userData);
      } else if (isStudent()) {
        response = await studentAPI.updateProfile(user.id, userData);
      } else {
        throw new Error('Naməlum istifadəçi rolu');
      }
      
      if (response.data) {
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profil yeniləmə uğursuz oldu' 
      };
    }
  };

  // Role checking functions
  const isAdmin = () => user?.role === 'admin';
  const isTeacher = () => user?.role === 'teacher';
  const isStudent = () => user?.role === 'student';

  // Get user role display name
  const getRoleDisplayName = () => {
    switch (user?.role) {
      case 'admin': return 'İdarəçi';
      case 'teacher': return 'Müəllim';
      case 'student': return 'Şagird';
      default: return 'İstifadəçi';
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return '?';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    isAdmin,
    isTeacher,
    isStudent,
    getRoleDisplayName,
    getUserInitials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
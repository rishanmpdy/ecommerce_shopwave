import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../features/auth/authSlice';


//A17 (Protected Route Guard: Authenticated aayittillatha users-ne login page-ilekku redirect cheyyukayum, login-nu shesham thirichethuvan ulla location save cheyyukayum cheyyunnu)
const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector(selectAuth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login but save the path they were trying to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the child routes
  return <Outlet />;
};

export default ProtectedRoute;

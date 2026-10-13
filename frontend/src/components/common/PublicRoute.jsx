import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingState from './LoadingState.jsx';


export default function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <LoadingState message="Checking session..." />
      </div>
    );
  }

  if (isAuthenticated) {
    const fromLocation = location.state?.from;
    const rawPath = typeof fromLocation === 'string'
      ? fromLocation
      : fromLocation?.pathname
        ? `${fromLocation.pathname}${fromLocation.search || ''}`
        : '/';
    const redirectPath = (!rawPath || rawPath === '/login' || rawPath === '/signup') ? '/' : rawPath;

    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
}

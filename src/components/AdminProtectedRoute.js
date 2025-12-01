import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function AdminProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setChecking(false);
        return;
      }

      try {
        if (currentUser.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  if (loading || checking) {
    return <div className="loading">Checking permissions...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
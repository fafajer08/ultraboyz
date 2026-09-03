import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <Box maxW="1080px" mx="auto" px={4} py={12}><Text color="gray.500">Loading…</Text></Box>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

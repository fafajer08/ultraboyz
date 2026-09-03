import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import UserDashboard from './UserDashboard.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
}

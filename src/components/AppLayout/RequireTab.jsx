import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../../shared/session';

const RequireTab = ({ tab }) => {
  const { hasTab } = useSession();
  return hasTab(tab) ? <Outlet /> : <Navigate to="/app" replace />;
};

export default RequireTab;

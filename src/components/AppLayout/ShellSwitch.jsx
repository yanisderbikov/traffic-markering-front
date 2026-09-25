import React from 'react';
import { Outlet } from 'react-router-dom';
import apiClient from '../../apiClient';
import AppLayout from './AppLayout';
import PublicLayout from '../shared/PublicLayout/PublicLayout';

const ShellSwitch = () => {
  if (apiClient.hasLiveToken()) return <AppLayout />;
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  );
};

export default ShellSwitch;

import React from 'react';
import apiClient from '../../apiClient';
import CreatorHome from './CreatorHome';
import CustomerHome from './CustomerHome';
import GenericHome from './GenericHome';

const AppHome = () => {
  const role = apiClient.getJwtMetadata()?.role;
  if (role === 'CREATOR') return <CreatorHome />;
  if (role === 'CUSTOMER') return <CustomerHome />;
  return <GenericHome />;
};

export default AppHome;

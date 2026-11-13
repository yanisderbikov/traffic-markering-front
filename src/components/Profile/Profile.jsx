import React from 'react';
import apiClient from '../../apiClient';
import CreatorProfile from '../CreatorProfile/CreatorProfile';
import CustomerProfile from '../CustomerProfile/CustomerProfile';
import CreatorSocialAccounts from '../CreatorSocialAccounts/CreatorSocialAccounts';
import ThemeSettings from './ThemeSettings';
import PartnerOffer from './PartnerOffer';

const PARTNER_ROLES = ['CUSTOMER', 'ADMIN'];

/**
 * Один адрес /app/profile на обе роли: какой профиль показать, решает роль из JWT.
 * Лишний запрос /api/auth/me не нужен — роль уже лежит в токене.
 */
const RoleProfile = ({ role }) => {
  if (role === 'CREATOR') {
    return (
      <>
        <CreatorProfile />
        <CreatorSocialAccounts />
      </>
    );
  }

  // У админа на бэке есть доступ к обоим профилям — показываем оба, друг под другом.
  if (role === 'ADMIN') {
    return (
      <>
        <CustomerProfile />
        <CreatorProfile />
        <CreatorSocialAccounts />
      </>
    );
  }

  // CUSTOMER и всё, что не распозналось: профиль заказчика, а нет прав — форма
  // покажет ошибку с бэка, это честнее пустой страницы.
  return <CustomerProfile />;
};

const Profile = () => {
  const role = apiClient.getJwtMetadata()?.role;

  return (
    <>
      <RoleProfile role={role} />
      <ThemeSettings>{PARTNER_ROLES.includes(role) && <PartnerOffer />}</ThemeSettings>
    </>
  );
};

export default Profile;

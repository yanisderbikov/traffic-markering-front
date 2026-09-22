import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import CampaignCard from '../shared/CampaignCard/CampaignCard';
import Logo from '../shared/Logo/Logo';
import styles from './Board.module.css';

// Иконка обновления — та же, что у RefreshButton в anyforms: круговая стрелка,
// которая крутится, пока идёт запрос.
const RefreshButton = ({ onClick, refreshing, label }) => (
  <button
    type="button"
    className={styles.refreshBtn}
    onClick={onClick}
    disabled={refreshing}
    title={label}
    aria-label={label}
  >
    <svg
      className={refreshing ? styles.spinning : undefined}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.9 8a5.9 5.9 0 1 1-1.73-4.17"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13.9 1.6v2.8h-2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
);

const Board = ({ embedded = false }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await apiClient.api.boardCampaigns();
      setCampaigns(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Не удалось загрузить доску объявлений'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCampaigns();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className={styles.wrap}>
      {!embedded && (
        <div className={styles.brand}>
          <Logo withText />
        </div>
      )}
      <header className={styles.head}>
        <div className={styles.headMain}>
          <h1 className={styles.title}>доска объявлений</h1>
          <p className={styles.subtitle}>
            заказчики платят за просмотры: ставка указана за 1000 просмотров, бюджет виден
            на шкале каждой карточки.
          </p>
        </div>
        <div className={styles.headActions}>
          {embedded ? (
            <RefreshButton
              onClick={handleRefresh}
              refreshing={refreshing}
              label="Обновить доску объявлений"
            />
          ) : (
            <Link to="/login" className={styles.cabinetLink}>
              войти
            </Link>
          )}
        </div>
      </header>

      {!embedded && (
        <div className={styles.banner}>
          <p className={styles.bannerText}>
            войдите как креатор, чтобы брать заказы: снимаете ролик, прикрепляете ссылку
            и получаете за просмотры.
          </p>
          <div className={styles.bannerActions}>
            <Link to="/login" className={styles.primaryLink}>
              войти
            </Link>
            <Link to="/register" className={styles.secondaryLink}>
              зарегистрироваться
            </Link>
          </div>
        </div>
      )}

      {error && <p className={styles.errorBanner}>{error}</p>}

      {loading ? (
        <p className={styles.message}>Загрузка объявлений…</p>
      ) : campaigns.length === 0 ? (
        <p className={styles.message}>
          {error ? 'Объявления не загрузились — попробуйте обновить.' : 'Активных объявлений пока нет. Загляните позже.'}
        </p>
      ) : (
        <div className={styles.grid}>
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id || campaign.publicId} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Board;

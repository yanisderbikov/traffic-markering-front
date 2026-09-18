import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import styles from './CreatorSocialAccounts.module.css';

const PLATFORMS = [
  { slug: 'instagram', platform: 'INSTAGRAM', label: 'Instagram' },
  { slug: 'tiktok', platform: 'TIKTOK', label: 'TikTok' },
  { slug: 'youtube', platform: 'YOUTUBE_SHORTS', label: 'YouTube Shorts' },
];

const STATUS_LABELS = {
  ACTIVE: 'подключён',
  EXPIRED: 'токен истёк, подключите заново',
  REVOKED: 'доступ отозван, подключите заново',
};

const RESULT_PARAMS = ['social', 'status', 'message'];

const errorText = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const formatFollowers = (value) =>
  typeof value === 'number' ? value.toLocaleString('ru-RU') : null;

const renderGeographyStatus = (account) => {
  if (account.platform !== 'YOUTUBE_SHORTS') return null;
  if (account.reportsViewGeography) {
    return <span className={styles.geo}>география просмотров: да</span>;
  }
  return (
    <span className={styles.geoWarn}>
      география просмотров: нет — переподключите, чтобы учитывались объявления с регионом
    </span>
  );
};

const CreatorSocialAccounts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingSlug, setPendingSlug] = useState('');
  const [error, setError] = useState('');

  const loadAccounts = useCallback(async () => {
    try {
      const res = await apiClient.instance.get('/api/social/accounts');
      setAccounts(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      setError(errorText(err, 'Не удалось загрузить привязанные аккаунты'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    const social = searchParams.get('social');
    const status = searchParams.get('status');
    if (!social || !status) {
      return;
    }

    const platform = PLATFORMS.find((item) => item.slug === social);
    const label = platform ? platform.label : social;

    if (status === 'connected') {
      const account = searchParams.get('message');
      toast.success(account ? `${label}: подключён ${account}` : `${label} подключён`);
      loadAccounts();
    } else if (status === 'denied') {
      toast(`Привязка ${label} отменена`);
    } else {
      toast.error(searchParams.get('message') || `Не удалось привязать ${label}`);
    }

    const next = new URLSearchParams(searchParams);
    RESULT_PARAMS.forEach((key) => next.delete(key));
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, loadAccounts]);

  const connect = async (slug) => {
    setPendingSlug(slug);
    try {
      const res = await apiClient.instance.post(`/api/social/${slug}/authorize`);
      const url = res?.data?.authorizationUrl;
      if (!url) {
        throw new Error('Площадка не вернула ссылку подключения');
      }
      window.location.assign(url);
    } catch (err) {
      toast.error(errorText(err, 'Не удалось начать подключение'));
      setPendingSlug('');
    }
  };

  const disconnect = async (account) => {
    const name = account.username ? `@${account.username}` : account.displayName || '';
    if (!window.confirm(`Отвязать ${account.platformLabel} ${name}?`.replace(/\s+\?$/, '?'))) {
      return;
    }
    try {
      await apiClient.instance.delete(`/api/social/accounts/${account.id}`);
      toast.success('Аккаунт отвязан');
      loadAccounts();
    } catch (err) {
      toast.error(errorText(err, 'Не удалось отвязать аккаунт'));
    }
  };

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Соцсети</h1>
      <p className={styles.subtitle}>
        Подключайте сколько угодно аккаунтов на каждой площадке — просмотры роликов
        мы считаем по официальному API площадки, а не с ваших слов.
      </p>

      {error && <p className={styles.banner}>{error}</p>}
      {loading && <p className={styles.message}>Загрузка аккаунтов…</p>}

      {!loading && (
        <div className={styles.platforms}>
          {PLATFORMS.map((platform) => {
            const connected = accounts.filter((account) => account.platform === platform.platform);
            return (
              <div key={platform.slug} className={styles.platform}>
                <div className={styles.platformHead}>
                  <span className={styles.platformName}>
                    <SocialIcon name={platform.slug} className={styles.platformIcon} />
                    {platform.label}
                  </span>
                  <span className={styles.platformCount}>
                    {connected.length === 0 ? 'нет аккаунтов' : `${connected.length} шт.`}
                  </span>
                </div>

                {connected.length > 0 && (
                  <ul className={styles.accounts}>
                    {connected.map((account) => {
                      const followers = formatFollowers(account.followers);
                      return (
                        <li key={account.id} className={styles.account}>
                          {account.avatarUrl ? (
                            <img
                              className={styles.avatar}
                              src={account.avatarUrl}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            <span className={styles.avatarStub} aria-hidden="true" />
                          )}
                          <span className={styles.accountInfo}>
                            <span className={styles.accountName}>
                              {account.username ? `@${account.username}` : account.displayName || account.externalId}
                            </span>
                            <span className={styles.accountMeta}>
                              {STATUS_LABELS[account.status] || account.status}
                              {followers ? ` · ${followers} подписчиков` : ''}
                            </span>
                            {renderGeographyStatus(account)}
                          </span>
                          <button
                            type="button"
                            className={styles.unlink}
                            onClick={() => disconnect(account)}
                          >
                            отвязать
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <button
                  type="button"
                  className={styles.connect}
                  onClick={() => connect(platform.slug)}
                  disabled={pendingSlug === platform.slug}
                >
                  <SocialIcon name={platform.slug} />
                  {pendingSlug === platform.slug
                    ? 'Открываем площадку…'
                    : `Подключить ${platform.label}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CreatorSocialAccounts;

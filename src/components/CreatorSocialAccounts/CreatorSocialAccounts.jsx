import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import Skeleton from '../shared/Skeleton/Skeleton';
import ui from '../../shared/ui.module.css';
import styles from './CreatorSocialAccounts.module.css';

const PLATFORMS = [
  { slug: 'instagram', platform: 'INSTAGRAM', label: 'Instagram' },
  { slug: 'tiktok', platform: 'TIKTOK', label: 'TikTok' },
  { slug: 'youtube', platform: 'YOUTUBE_SHORTS', label: 'YouTube Shorts' },
];

const STATUS_LABELS = {
  ACTIVE: 'Подключён',
  EXPIRED: 'Токен истёк, подключите заново',
  REVOKED: 'Доступ отозван, подключите заново',
};

const RESULT_PARAMS = ['social', 'status', 'message'];

const errorText = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const formatFollowers = (value) =>
  typeof value === 'number' ? value.toLocaleString('ru-RU') : null;

const renderGeographyStatus = (account) => {
  if (account.platform !== 'YOUTUBE_SHORTS') return null;
  if (account.reportsViewGeography) {
    return <span className={styles.geo}>География просмотров: да</span>;
  }
  return (
    <span className={styles.geoWarn}>
      География просмотров: нет — переподключите, чтобы учитывались кампании с регионом
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
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Креатор</span>
          <h1 className={ui.title}>Соцсети</h1>
          <p className={ui.subtitle}>
            Подключайте сколько угодно аккаунтов на каждой площадке — просмотры роликов мы считаем
            по официальному API площадки, а не с ваших слов.
          </p>
        </div>
      </header>

      {error && <p className={ui.errorBanner}>{error}</p>}
      {loading && (
        <div className={ui.grid3} aria-busy="true">
          {PLATFORMS.map((platform) => (
            <section key={platform.slug} className={`${ui.card} ${styles.platform}`}>
              <div className={styles.platformHead}>
                <span className={styles.platformName}>
                  <SocialIcon name={platform.slug} className={styles.platformIcon} />
                  {platform.label}
                </span>
                <Skeleton width="6rem" height={30} radius="999px" />
              </div>
              <div className={styles.account}>
                <Skeleton width={36} height={36} radius="50%" />
                <span className={styles.accountInfo}>
                  <span className={styles.accountName}>
                    <Skeleton width="8rem" />
                  </span>
                  <span className={styles.accountMeta}>
                    <Skeleton width="10rem" />
                  </span>
                </span>
              </div>
              <Skeleton block height={44} radius="var(--button-radius)" />
            </section>
          ))}
        </div>
      )}

      {!loading && (
        <div className={ui.grid3}>
          {PLATFORMS.map((platform) => {
            const connected = accounts.filter((account) => account.platform === platform.platform);
            return (
              <section key={platform.slug} className={`${ui.card} ${styles.platform}`}>
                <div className={styles.platformHead}>
                  <span className={styles.platformName}>
                    <SocialIcon name={platform.slug} className={styles.platformIcon} />
                    {platform.label}
                  </span>
                  <span className={connected.length ? ui.chipSuccess : ui.chip}>
                    {connected.length === 0 ? 'Нет аккаунтов' : `${connected.length} шт.`}
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
                            className={`${ui.btnGhost} ${ui.btnSmall}`}
                            onClick={() => disconnect(account)}
                          >
                            Отвязать
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                <button
                  type="button"
                  className={`${connected.length ? ui.btnSecondary : ui.btnPrimary} ${ui.btnBlock} ${styles.connect}`}
                  onClick={() => connect(platform.slug)}
                  disabled={pendingSlug === platform.slug}
                >
                  <SocialIcon name={platform.slug} />
                  {pendingSlug === platform.slug
                    ? 'Открываем площадку…'
                    : `Подключить ${platform.label}`}
                </button>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CreatorSocialAccounts;

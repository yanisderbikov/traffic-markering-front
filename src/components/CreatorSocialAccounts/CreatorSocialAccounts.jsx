import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import Skeleton from '../shared/Skeleton/Skeleton';
import ui from '../../shared/ui.module.css';
import styles from './CreatorSocialAccounts.module.css';

const PLATFORMS = [
  {
    slug: 'instagram',
    platform: 'INSTAGRAM',
    label: 'Instagram',
    placeholder: '@nickname или instagram.com/nickname',
  },
  {
    slug: 'tiktok',
    platform: 'TIKTOK',
    label: 'TikTok',
    placeholder: '@nickname или tiktok.com/@nickname',
  },
  {
    slug: 'youtube',
    platform: 'YOUTUBE_SHORTS',
    label: 'YouTube Shorts',
    placeholder: '@channel или ссылка на канал',
  },
];

// OAUTH — кнопка уводит на площадку; SCRAPE — ник и код в описании профиля.
// Старый бэк без /api/social/mode работает как раньше, через OAuth.
const MODE_OAUTH = 'OAUTH';
const MODE_SCRAPE = 'SCRAPE';
const EMPTY_LINKING = { slug: '', account: '', verification: null, busy: '' };

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
  // Привязка по коду географию не даёт вовсе, переподключение тут не поможет.
  if (account.platform !== 'YOUTUBE_SHORTS' || account.linkMethod === MODE_SCRAPE) return null;
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
  const [mode, setMode] = useState(MODE_OAUTH);
  const [linking, setLinking] = useState(EMPTY_LINKING);
  const { hash } = useLocation();
  const sectionRef = useRef(null);

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
    apiClient.instance
      .get('/api/social/mode')
      .then((res) => setMode(res?.data?.mode === MODE_SCRAPE ? MODE_SCRAPE : MODE_OAUTH))
      .catch(() => setMode(MODE_OAUTH));
  }, []);

  const scrapeMode = mode === MODE_SCRAPE;

  // Ссылки «Управлять» и «Привязать аккаунт» ведут сразу к этому блоку профиля.
  useEffect(() => {
    if (!loading && hash === '#socials') {
      sectionRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [loading, hash]);

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

  const openLinking = (slug) => setLinking({ ...EMPTY_LINKING, slug });

  const closeLinking = () => setLinking(EMPTY_LINKING);

  const requestCode = async (event, platform) => {
    event.preventDefault();
    const account = linking.account.trim();
    if (!account) {
      toast.error('Укажите ник или ссылку на профиль');
      return;
    }
    setLinking((prev) => ({ ...prev, busy: 'code' }));
    try {
      const res = await apiClient.instance.post(`/api/social/${platform.slug}/verification`, {
        account,
      });
      setLinking((prev) => ({ ...prev, account, verification: res.data, busy: '' }));
    } catch (err) {
      toast.error(errorText(err, `Не удалось найти аккаунт ${platform.label}`));
      setLinking((prev) => ({ ...prev, busy: '' }));
    }
  };

  const confirmCode = async (platform) => {
    setLinking((prev) => ({ ...prev, busy: 'confirm' }));
    try {
      const res = await apiClient.instance.post(
        `/api/social/${platform.slug}/verification/confirm`,
        { account: linking.account }
      );
      const name = res?.data?.username ? `@${res.data.username}` : res?.data?.displayName || '';
      toast.dismiss();
      toast.success(
        `${platform.label}: подключён ${name}`.trim() + '. Код из описания теперь можно убрать'
      );
      closeLinking();
      loadAccounts();
    } catch (err) {
      toast.error(errorText(err, 'Не удалось подтвердить аккаунт'));
      setLinking((prev) => ({ ...prev, busy: '' }));
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Код скопирован');
    } catch {
      toast.error('Не удалось скопировать — выделите код вручную');
    }
  };

  const connect = async (slug) => {
    if (scrapeMode) {
      openLinking(slug);
      return;
    }
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

  // Шаг 1 — ник или ссылка; шаг 2 — найденный профиль, код и «Проверить».
  const renderLinking = (platform) => {
    const { verification, busy } = linking;
    if (!verification) {
      const inputId = `social-account-${platform.slug}`;
      return (
        <form className={styles.linking} onSubmit={(event) => requestCode(event, platform)}>
          <label className={ui.label} htmlFor={inputId}>
            Ник или ссылка на профиль
          </label>
          <input
            id={inputId}
            className={ui.input}
            value={linking.account}
            onChange={(event) => setLinking((prev) => ({ ...prev, account: event.target.value }))}
            placeholder={platform.placeholder}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={300}
            autoFocus
          />
          <div className={styles.linkingActions}>
            <button
              type="submit"
              className={`${ui.btnPrimary} ${ui.btnBlock}`}
              disabled={busy === 'code'}
            >
              {busy === 'code' ? 'Ищем аккаунт…' : 'Получить код'}
            </button>
            <button type="button" className={`${ui.btnGhost} ${ui.btnBlock}`} onClick={closeLinking}>
              Отмена
            </button>
          </div>
        </form>
      );
    }

    const followers = formatFollowers(verification.followers);
    const name = verification.username
      ? `@${verification.username}`
      : verification.displayName || verification.externalId;
    const meta = [
      verification.username ? verification.displayName : null,
      followers ? `${followers} подписчиков` : null,
    ]
      .filter(Boolean)
      .join(' · ');
    return (
      <div className={styles.linking}>
        <div className={styles.account}>
          {verification.avatarUrl ? (
            <img className={styles.avatar} src={verification.avatarUrl} alt="" loading="lazy" />
          ) : (
            <span className={styles.avatarStub} aria-hidden="true" />
          )}
          <span className={styles.accountInfo}>
            <span className={styles.accountName}>{name}</span>
            {meta && <span className={styles.accountMeta}>{meta}</span>}
          </span>
        </div>

        <p className={styles.step}>
          {`Сохраните этот код в профиле — мы найдём его в ${verification.codePlacement || 'описании профиля'}.`}
        </p>
        <div className={styles.codeRow}>
          <code className={styles.code}>{verification.code}</code>
          <button
            type="button"
            className={`${ui.btnSecondary} ${ui.btnSmall}`}
            onClick={() => copyCode(verification.code)}
          >
            Скопировать
          </button>
        </div>
        <p className={verification.codeFound ? ui.hintOk : ui.hint}>
          {verification.codeFound
            ? 'Код уже стоит в описании — осталось подтвердить.'
            : 'Код можно поставить в любое место описания. После привязки его можно убрать.'}
        </p>

        <div className={styles.linkingActions}>
          <button
            type="button"
            className={`${ui.btnPrimary} ${ui.btnBlock}`}
            onClick={() => confirmCode(platform)}
            disabled={busy === 'confirm'}
          >
            {busy === 'confirm' ? 'Проверяем описание…' : 'Проверить'}
          </button>
          <button
            type="button"
            className={`${ui.btnGhost} ${ui.btnBlock}`}
            onClick={() => openLinking(platform.slug)}
            disabled={busy === 'confirm'}
          >
            Другой аккаунт
          </button>
        </div>
      </div>
    );
  };

  return (
    <section ref={sectionRef} className={`${ui.page} ${styles.page}`}>
      <h2 className={ui.sectionTitle}>Привязанные аккаунты</h2>
      <p className={`${ui.hint} ${styles.lead}`}>
        {scrapeMode
          ? 'Подключайте сколько угодно аккаунтов на каждой площадке. Чтобы подтвердить, что аккаунт ваш, добавьте в описание профиля короткий код — после привязки его можно убрать. Профиль должен быть открытым: просмотры мы берём из публичной статистики ролика, а не с ваших слов.'
          : 'Подключайте сколько угодно аккаунтов на каждой площадке — просмотры роликов мы считаем по официальному API площадки, а не с ваших слов.'}
      </p>

      {error && <p className={ui.errorBanner}>{error}</p>}
      {loading && (
        <div className={styles.grid} aria-busy="true">
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
        <div className={styles.grid}>
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

                {scrapeMode && linking.slug === platform.slug ? (
                  renderLinking(platform)
                ) : (
                  <button
                    type="button"
                    className={`${connected.length ? ui.btnSecondary : ui.btnPrimary} ${ui.btnBlock} ${styles.connect}`}
                    onClick={() => connect(platform.slug)}
                    disabled={pendingSlug === platform.slug}
                    aria-label={`Подключить ${platform.label}`}
                  >
                    <SocialIcon name={platform.slug} />
                    {pendingSlug === platform.slug
                      ? 'Открываем площадку…'
                      : connected.length ? 'Подключить ещё' : 'Подключить аккаунт'}
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CreatorSocialAccounts;

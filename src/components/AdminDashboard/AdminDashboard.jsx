import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';
import { errorMessage } from '../../shared/auth';
import { formatRubles, formatViews } from '../../shared/money';
import { formatDate } from '../../shared/dictionaries';
import { plural } from '../AppHome/homeStats';
import FitRubles from '../shared/FitRubles/FitRubles';
import Skeleton from '../shared/Skeleton/Skeleton';
import ui from '../../shared/ui.module.css';
import styles from './AdminDashboard.module.css';

const DASHBOARD_URL = '/api/superadmin/dashboard';

const PERIODS = [
  { days: 7, label: '7 дней' },
  { days: 30, label: '30 дней' },
  { days: 90, label: '90 дней' },
  { days: 365, label: 'Год' },
];

const periodText = (days) => `за ${days} ${plural(days, ['день', 'дня', 'дней'])}`;

// Прирост за период: «+3 за 30 дней» или «+1 500 ₽ за 30 дней».
const Delta = ({ value, days, money = false }) => {
  const amount = Number(value) || 0;
  const shown = money ? formatRubles(Math.abs(amount)) : formatViews(Math.abs(amount));
  const sign = amount < 0 ? '−' : '+';
  return (
    <span className={ui.statNote}>
      <span className={amount > 0 ? ui.statUp : undefined}>
        {sign}
        {shown}
      </span>{' '}
      {periodText(days)}
    </span>
  );
};

const Stat = ({ label, loading, children, note }) => (
  <div className={ui.stat} aria-busy={loading || undefined}>
    <span className={ui.statLabel}>{label}</span>
    {loading ? <Skeleton width="7ch" height={30} /> : children}
    {loading ? <Skeleton width="12ch" /> : note}
  </div>
);

const AdminDashboard = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient.instance
      .get(DASHBOARD_URL, { params: { days } })
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  // При смене периода показываем прошлые цифры, пока не придут новые, —
  // скелетон только на первой загрузке.
  const empty = loading && !data;
  const period = data?.periodDays ?? days;
  const commission = data?.commissionPercent != null ? `${data.commissionPercent}%` : '';

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Администрирование</span>
          <h1 className={ui.title}>Аналитика площадки</h1>
          <p className={ui.subtitle}>
            Значения за всё время и прирост за выбранный период.
            {data?.generatedAt && ` Обновлено ${formatDate(data.generatedAt)}.`}
          </p>
        </div>
        <div className={ui.pageHeadActions}>
          <div className={ui.chips} role="group" aria-label="Период">
            {PERIODS.map((item) => (
              <button
                key={item.days}
                type="button"
                className={item.days === days ? ui.chipActive : ui.chip}
                aria-pressed={item.days === days}
                onClick={() => setDays(item.days)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && <p className={ui.errorBanner}>{errorMessage(error, 'Не удалось загрузить аналитику')}</p>}

      {(data || empty) && (
        <div className={`${styles.sections} ${loading && data ? styles.refreshing : ''}`}>
          <section>
            <div className={ui.sectionHead}>
              <h2 className={ui.sectionTitle}>Аудитория и контент</h2>
            </div>
            <div className={ui.grid4}>
              <Stat
                label="Креаторы"
                loading={empty}
                note={<Delta value={data?.creators.period} days={period} />}
              >
                <span className={ui.statValue}>{formatViews(data?.creators.total)}</span>
              </Stat>
              <Stat
                label="Заказчики"
                loading={empty}
                note={<Delta value={data?.customers.period} days={period} />}
              >
                <span className={ui.statValue}>{formatViews(data?.customers.total)}</span>
              </Stat>
              <Stat
                label="Опубликовано видео"
                loading={empty}
                note={<Delta value={data?.publishedVideos.period} days={period} />}
              >
                <span className={ui.statValue}>{formatViews(data?.publishedVideos.total)}</span>
              </Stat>
              <Stat
                label="Просмотры"
                loading={empty}
                note={
                  <span className={ui.statNote}>
                    активных кампаний: {formatViews(data?.activeCampaigns)}
                  </span>
                }
              >
                <span className={ui.statValue}>{formatViews(data?.views)}</span>
              </Stat>
            </div>
          </section>

          <section>
            <div className={ui.sectionHead}>
              <h2 className={ui.sectionTitle}>Деньги</h2>
            </div>
            <div className={ui.grid4}>
              <Stat
                label="Рекламный оборот"
                loading={empty}
                note={<Delta value={data?.adTurnoverKopecks.period} days={period} money />}
              >
                <FitRubles className={ui.statValue} kopecks={data?.adTurnoverKopecks.total ?? 0} />
              </Stat>
              <Stat
                label="Пополнения заказчиков"
                loading={empty}
                note={<Delta value={data?.topUpsKopecks.period} days={period} money />}
              >
                <FitRubles className={ui.statValue} kopecks={data?.topUpsKopecks.total ?? 0} />
              </Stat>
              <Stat
                label={`Комиссия платформы${commission ? ` · ${commission}` : ''}`}
                loading={empty}
                note={<Delta value={data?.commissionKopecks.period} days={period} money />}
              >
                <FitRubles className={ui.statValue} kopecks={data?.commissionKopecks.total ?? 0} />
              </Stat>
              <Stat
                label="Доход платформы"
                loading={empty}
                note={<Delta value={data?.platformIncomeKopecks.period} days={period} money />}
              >
                <FitRubles
                  className={`${ui.statValue} ${ui.statAccent}`}
                  kopecks={data?.platformIncomeKopecks.total ?? 0}
                />
              </Stat>
            </div>
            {data && (
              <p className={styles.footnote}>
                Доход — комиссия за вычетом партнёрских вознаграждений:{' '}
                {formatRubles(data.partnerRewardsKopecks.total)} за всё время,{' '}
                {formatRubles(data.partnerRewardsKopecks.period)} {periodText(period)}.
              </p>
            )}
          </section>

          <section className={ui.card}>
            <h2 className={ui.cardTitle}>Как считаются цифры</h2>
            <dl className={styles.glossary}>
              <dt>Креаторы и заказчики</dt>
              <dd>Учётки с подтверждённой почтой; прирост — подтвердившие почту за период.</dd>
              <dt>Опубликовано видео</dt>
              <dd>
                Ролики, прошедшие модерацию. Прирост — по дате публикации на площадке, если она
                неизвестна — по дате отклика.
              </dd>
              <dt>Просмотры</dt>
              <dd>Последний замер по опубликованным роликам.</dd>
              <dt>Рекламный оборот</dt>
              <dd>
                Начислено креаторам за просмотры — столько заказчики потратили из бюджетов
                кампаний.
              </dd>
              <dt>Пополнения и комиссия</dt>
              <dd>
                Только подтверждённые операции. Комиссия берётся с пополнений, выводов и выплат.
              </dd>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

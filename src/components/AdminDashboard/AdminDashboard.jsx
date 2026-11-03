import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';
import { errorMessage } from '../../shared/auth';
import { formatRubles, formatRublesCompact, formatViews } from '../../shared/money';
import { formatDate } from '../../shared/dictionaries';
import { plural } from '../AppHome/homeStats';
import FitRubles from '../shared/FitRubles/FitRubles';
import Skeleton from '../shared/Skeleton/Skeleton';
import TimeChart from './TimeChart';
import { STEPS, bucketLabel, defaultStep, isStepAllowed, sumOf } from './series';
import ui from '../../shared/ui.module.css';
import styles from './AdminDashboard.module.css';

const DASHBOARD_URL = '/api/superadmin/dashboard';
const SERIES_URL = '/api/superadmin/dashboard/series';

// days = null — за всё время.
const PERIODS = [
  { days: 7, label: '7 дней' },
  { days: 30, label: '30 дней' },
  { days: 90, label: '90 дней' },
  { days: 365, label: 'Год' },
  { days: null, label: 'Всё время' },
];

const TIME_ZONE = (() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
})();

const COMPACT = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const countTick = (value) => COMPACT.format(value);
const moneyTick = (value) => formatRublesCompact(value);

const periodText = (days) =>
  days == null ? 'за всё время' : `за ${days} ${plural(days, ['день', 'дня', 'дней'])}`;

const count = (key) => (point) => formatViews(point[key]);
const money = (key) => (point) => formatRubles(point[key]);
const gain = (key) => (point) => `+${formatViews(point[key])}`;

// Графики по секциям: что рисуем, как подписываем деления и что показываем в подсказке.
const CONTENT_CHARTS = [
  {
    key: 'creators',
    title: 'Новые креаторы',
    rows: [{ label: 'подтвердили почту', format: count('creators') }],
  },
  {
    key: 'customers',
    title: 'Новые заказчики',
    rows: [{ label: 'подтвердили почту', format: count('customers') }],
  },
  {
    key: 'publishedVideos',
    title: 'Опубликованные видео',
    rows: [{ label: 'роликов прошли модерацию', format: count('publishedVideos') }],
  },
  {
    key: 'views',
    title: 'Прирост просмотров',
    rows: [
      { label: 'просмотров за шаг', format: gain('views') },
      { label: 'всего на конец шага', format: count('viewsTotal') },
    ],
  },
];

const MONEY_CHARTS = [
  {
    key: 'adTurnoverKopecks',
    title: 'Рекламный оборот',
    money: true,
    rows: [{ label: 'начислено креаторам', format: money('adTurnoverKopecks') }],
  },
  {
    key: 'topUpsKopecks',
    title: 'Пополнения заказчиков',
    money: true,
    rows: [{ label: 'подтверждено', format: money('topUpsKopecks') }],
  },
  {
    key: 'commissionKopecks',
    title: 'Комиссия платформы',
    money: true,
    rows: [{ label: 'с пополнений, выводов и выплат', format: money('commissionKopecks') }],
  },
  {
    key: 'platformIncomeKopecks',
    title: 'Доход платформы',
    money: true,
    rows: [
      { label: 'доход', format: money('platformIncomeKopecks') },
      { label: 'комиссия', format: money('commissionKopecks') },
      { label: 'партнёрам', format: money('partnerRewardsKopecks') },
    ],
  },
];

const VIEWS_TOTAL_ROWS = [
  { label: 'просмотров всего', format: count('viewsTotal') },
  { label: 'прирост за шаг', format: gain('views') },
];

const TABLE_COLUMNS = [
  { key: 'creators', label: 'Креаторы', format: count('creators') },
  { key: 'customers', label: 'Заказчики', format: count('customers') },
  { key: 'publishedVideos', label: 'Видео', format: count('publishedVideos') },
  { key: 'views', label: 'Прирост просмотров', format: count('views') },
  { key: 'viewsTotal', label: 'Просмотров всего', format: count('viewsTotal') },
  { key: 'adTurnoverKopecks', label: 'Оборот', format: money('adTurnoverKopecks') },
  { key: 'topUpsKopecks', label: 'Пополнения', format: money('topUpsKopecks') },
  { key: 'commissionKopecks', label: 'Комиссия', format: money('commissionKopecks') },
  { key: 'platformIncomeKopecks', label: 'Доход', format: money('platformIncomeKopecks') },
];

const useFetch = (url, params) => {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));
    apiClient.instance
      .get(url, { params: JSON.parse(key) })
      .then((res) => {
        if (!cancelled) setState({ data: res.data, error: null, loading: false });
      })
      .catch((err) => {
        if (!cancelled) setState((prev) => ({ ...prev, error: err, loading: false }));
      });
    return () => {
      cancelled = true;
    };
  }, [url, key]);

  return state;
};

// Прирост за период: «+3 за 30 дней» или «+1 500 ₽ за 30 дней».
const Delta = ({ value, days, money: isMoney = false }) => {
  const amount = Number(value) || 0;
  const shown = isMoney ? formatRubles(Math.abs(amount)) : formatViews(Math.abs(amount));
  return (
    <span className={ui.statNote}>
      <span className={amount > 0 ? ui.statUp : undefined}>
        {amount < 0 ? '−' : '+'}
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

const ChartCard = ({ title, summary, children }) => (
  <section className={`${ui.card} ${styles.chartCard}`}>
    <header className={styles.chartHead}>
      <h3 className={styles.chartTitle}>{title}</h3>
      {summary && <span className={styles.chartSummary}>{summary}</span>}
    </header>
    {children}
  </section>
);

const ChartBody = ({ series, render }) => {
  if (series.error && !series.data) {
    return <p className={ui.errorText}>{errorMessage(series.error, 'Не удалось загрузить график')}</p>;
  }
  if (!series.data) return <Skeleton block height={180} radius={8} />;
  if (series.data.points.length === 0) return <p className={ui.message}>Данных за период нет.</p>;
  return render(series.data);
};

const AdminDashboard = () => {
  const [days, setDays] = useState(30);
  const [step, setStep] = useState(defaultStep(30));

  // Плитки считают прирост за period; для «всего времени» прирост не показываем —
  // он совпал бы со значением.
  const summary = useFetch(DASHBOARD_URL, { days: days ?? 365 });
  const series = useFetch(SERIES_URL, { days: days ?? undefined, step, tz: TIME_ZONE });

  const selectPeriod = (next) => {
    setDays(next);
    setStep(defaultStep(next));
  };

  const data = summary.data;
  const empty = summary.loading && !data;
  const showDelta = days != null;
  const commission = data?.commissionPercent != null ? `${data.commissionPercent}%` : '';
  const points = series.data?.points ?? [];
  const seriesStep = series.data?.step ?? step;
  const refreshing = (summary.loading && data) || (series.loading && series.data);

  const chartSummary = (key, isMoney) =>
    series.data
      ? `${isMoney ? formatRubles(sumOf(points, key)) : formatViews(sumOf(points, key))} ${periodText(days)}`
      : null;

  const renderCharts = (charts) => (
    <div className={ui.grid2}>
      {charts.map((chart) => (
        <ChartCard key={chart.key} title={chart.title} summary={chartSummary(chart.key, chart.money)}>
          <ChartBody
            series={series}
            render={(d) => (
              <TimeChart
                points={d.points}
                step={d.step}
                valueKey={chart.key}
                integer={!chart.money}
                formatTick={chart.money ? moneyTick : countTick}
                rows={chart.rows}
                label={`${chart.title} ${periodText(days)} по шагам`}
              />
            )}
          />
        </ChartCard>
      ))}
    </div>
  );

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Администрирование</span>
          <h1 className={ui.title}>Аналитика площадки</h1>
          <p className={ui.subtitle}>
            Значения за всё время, прирост и графики за выбранный период.
            {data?.generatedAt && ` Обновлено ${formatDate(data.generatedAt)}.`}
          </p>
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.filter}>
          <span className={styles.filterLabel}>Период</span>
          <div className={ui.chips} role="group" aria-label="Период">
          {PERIODS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={item.days === days ? ui.chipActive : ui.chip}
              aria-pressed={item.days === days}
              onClick={() => selectPeriod(item.days)}
            >
              {item.label}
            </button>
          ))}
          </div>
        </div>
        <div className={styles.filter}>
          <span className={styles.filterLabel}>Шаг графиков</span>
          <div className={ui.chips} role="group" aria-label="Шаг графиков">
          {STEPS.map((item) => {
            const allowed = isStepAllowed(item.key, days);
            return (
              <button
                key={item.key}
                type="button"
                className={item.key === step ? ui.chipActive : ui.chip}
                aria-pressed={item.key === step}
                disabled={!allowed}
                title={allowed ? undefined : 'Для этого периода шаг не подходит'}
                onClick={() => setStep(item.key)}
              >
                {item.label}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {summary.error && (
        <p className={ui.errorBanner}>{errorMessage(summary.error, 'Не удалось загрузить аналитику')}</p>
      )}

      <div className={`${styles.sections} ${refreshing ? styles.refreshing : ''}`}>
        <section>
          <div className={ui.sectionHead}>
            <h2 className={ui.sectionTitle}>Аудитория и контент</h2>
          </div>
          <div className={ui.grid4}>
            <Stat
              label="Креаторы"
              loading={empty}
              note={showDelta && <Delta value={data?.creators.period} days={days} />}
            >
              <span className={ui.statValue}>{formatViews(data?.creators.total)}</span>
            </Stat>
            <Stat
              label="Заказчики"
              loading={empty}
              note={showDelta && <Delta value={data?.customers.period} days={days} />}
            >
              <span className={ui.statValue}>{formatViews(data?.customers.total)}</span>
            </Stat>
            <Stat
              label="Опубликовано видео"
              loading={empty}
              note={showDelta && <Delta value={data?.publishedVideos.period} days={days} />}
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

          <div className={styles.chartStack}>
            <ChartCard
              title="Объём просмотров"
              summary={series.data ? `+${formatViews(sumOf(points, 'views'))} ${periodText(days)}` : null}
            >
              <ChartBody
                series={series}
                render={(d) => (
                  <TimeChart
                    points={d.points}
                    step={d.step}
                    valueKey="viewsTotal"
                    kind="line"
                    integer
                    height={240}
                    formatTick={countTick}
                    rows={VIEWS_TOTAL_ROWS}
                    label={`Накопленные просмотры ${periodText(days)}`}
                  />
                )}
              />
            </ChartCard>
            {renderCharts(CONTENT_CHARTS)}
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
              note={showDelta && <Delta value={data?.adTurnoverKopecks.period} days={days} money />}
            >
              <FitRubles className={ui.statValue} kopecks={data?.adTurnoverKopecks.total ?? 0} />
            </Stat>
            <Stat
              label="Пополнения заказчиков"
              loading={empty}
              note={showDelta && <Delta value={data?.topUpsKopecks.period} days={days} money />}
            >
              <FitRubles className={ui.statValue} kopecks={data?.topUpsKopecks.total ?? 0} />
            </Stat>
            <Stat
              label={`Комиссия платформы${commission ? ` · ${commission}` : ''}`}
              loading={empty}
              note={showDelta && <Delta value={data?.commissionKopecks.period} days={days} money />}
            >
              <FitRubles className={ui.statValue} kopecks={data?.commissionKopecks.total ?? 0} />
            </Stat>
            <Stat
              label="Доход платформы"
              loading={empty}
              note={showDelta && <Delta value={data?.platformIncomeKopecks.period} days={days} money />}
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
              {formatRubles(data.partnerRewardsKopecks.total)} за всё время
              {showDelta && `, ${formatRubles(data.partnerRewardsKopecks.period)} ${periodText(days)}`}.
            </p>
          )}
          <div className={styles.chartStack}>{renderCharts(MONEY_CHARTS)}</div>
        </section>

        {points.length > 0 && (
          <details className={`${ui.card} ${styles.tableCard}`}>
            <summary className={styles.tableSummary}>Таблица по шагам</summary>
            <div className={ui.tableWrap}>
              <table className={ui.table}>
                <thead>
                  <tr>
                    <th>Период</th>
                    {TABLE_COLUMNS.map((column) => (
                      <th key={column.key} className={ui.right}>
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {points.map((point) => (
                    <tr key={point.start}>
                      <td className={styles.nowrap}>{bucketLabel(point, seriesStep)}</td>
                      {TABLE_COLUMNS.map((column) => (
                        <td key={column.key} className={`${ui.right} ${styles.nowrap}`}>
                          {column.format(point)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

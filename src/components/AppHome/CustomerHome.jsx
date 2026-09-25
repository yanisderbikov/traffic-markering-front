import React from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { useRequest } from './useRequest';
import {
  asList,
  awaitingWalletOperations,
  campaignStats,
  exhaustedCampaigns,
  plural,
} from './homeStats';
import { errorMessage } from '../../shared/auth';
import { formatRubles, formatViews } from '../../shared/money';
import { CAMPAIGN_STATUS_LABELS } from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';
import styles from './AppHome.module.css';

const LOADERS = {
  campaigns: () => apiClient.api.myCampaigns(),
  wallet: () => apiClient.api.myWallet(),
  walletOperations: () => apiClient.api.myWalletOperations(),
};

const STATUS_CHIP = {
  ACTIVE: ui.chipSuccess,
  PAUSED: ui.chipWarning,
  DRAFT: ui.chipOutline,
  COMPLETED: ui.chipOutline,
};

const CHART_BARS = 7;

const formatCompactViews = (views) => {
  const n = Number(views) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace('.', ',')} млн`;
  if (n >= 10_000) return `${Math.round(n / 1000)} тыс.`;
  return formatViews(n);
};

const CustomerHome = () => {
  const campaigns = useRequest(true, LOADERS.campaigns);
  const wallet = useRequest(true, LOADERS.wallet);
  const walletOperations = useRequest(true, LOADERS.walletOperations);

  const rows = asList(campaigns.data);
  const stats = campaignStats(rows);
  const spent = rows.reduce((sum, row) => sum + (Number(row.spentKopecks) || 0), 0);
  const allocated = rows
    .filter((row) => row.status !== 'COMPLETED')
    .reduce((sum, row) => sum + (Number(row.budgetKopecks) || 0), 0);
  const remaining = rows
    .filter((row) => row.status === 'ACTIVE' || row.status === 'PAUSED')
    .reduce((sum, row) => sum + Math.max(0, Number(row.remainingKopecks) || 0), 0);
  const usedPercent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;
  const cpv = stats.views > 0 ? spent / stats.views : 0;

  const topByViews = [...rows]
    .filter((row) => (row.totalViews ?? 0) > 0)
    .sort((a, b) => (b.totalViews ?? 0) - (a.totalViews ?? 0))
    .slice(0, CHART_BARS);
  const maxViews = topByViews[0]?.totalViews || 1;

  const active = rows
    .filter((row) => row.status === 'ACTIVE' || row.status === 'PAUSED')
    .slice(0, 5);

  const attention = [];
  const awaitingOps = awaitingWalletOperations(walletOperations.data);
  if (awaitingOps > 0) {
    attention.push({
      to: '/app/wallet',
      count: awaitingOps,
      text: `${plural(awaitingOps, ['операция ждёт', 'операции ждут', 'операций ждут'])} вашего действия`,
    });
  }
  const exhausted = exhaustedCampaigns(rows);
  if (exhausted > 0) {
    attention.push({
      to: '/app/campaigns',
      count: exhausted,
      text: `${plural(exhausted, ['кампания исчерпала', 'кампании исчерпали', 'кампаний исчерпали'])} бюджет`,
    });
  }

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Рекламодатель</span>
          <h1 className={ui.title}>Обзор кампаний</h1>
          <p className={ui.subtitle}>Все результаты вашего контента в одном месте.</p>
        </div>
        <div className={ui.pageHeadActions}>
          <Link to="/app/campaigns/new" className={ui.btnPrimary}>
            + Создать кампанию
          </Link>
        </div>
      </header>

      {attention.map((row) => (
        <Link key={row.to} to={row.to} className={styles.attention}>
          <span className={styles.attentionCount}>{row.count}</span>
          <span>{row.text}</span>
          <span className={styles.attentionArrow}>→</span>
        </Link>
      ))}

      {campaigns.error && (
        <p className={ui.errorBanner}>
          {errorMessage(campaigns.error, 'Не удалось загрузить кампании')}
        </p>
      )}

      <div className={ui.grid4}>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Подтверждённые просмотры</span>
          <span className={ui.statValue}>
            {campaigns.loading ? '…' : formatCompactViews(stats.views)}
          </span>
          <span className={ui.statNote}>по всем кампаниям</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Начислено креаторам</span>
          <span className={ui.statValue}>{campaigns.loading ? '…' : formatRubles(spent)}</span>
          <span className={ui.statNote}>из бюджета {formatRubles(allocated)}</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Средняя цена просмотра</span>
          <span className={ui.statValue}>
            {campaigns.loading ? '…' : cpv > 0 ? formatRubles(Math.round(cpv)) : '—'}
          </span>
          <span className={ui.statNote}>в рамках заданных ставок</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Откликов креаторов</span>
          <span className={ui.statValue}>{campaigns.loading ? '…' : stats.applications}</span>
          <span className={ui.statNote}>
            {stats.active} {plural(stats.active, ['активная кампания', 'активные кампании', 'активных кампаний'])}
          </span>
        </div>
      </div>

      <div className={styles.customerMid}>
        <section className={ui.card}>
          <div className={styles.cardHead}>
            <h2 className={ui.cardTitle}>Просмотры по кампаниям</h2>
          </div>
          {campaigns.loading ? (
            <p className={ui.message}>Загрузка…</p>
          ) : topByViews.length === 0 ? (
            <p className={ui.message}>
              Просмотров пока нет. Они появятся, когда креаторы опубликуют первые ролики.
            </p>
          ) : (
            <div className={styles.chart} role="img" aria-label="Просмотры по кампаниям">
              {topByViews.map((row, index) => (
                <Link
                  key={row.id}
                  to={`/app/campaigns/${row.id}`}
                  className={styles.bar}
                  title={`${row.title}: ${formatViews(row.totalViews)}`}
                >
                  <span className={styles.barValue}>{formatCompactViews(row.totalViews)}</span>
                  <span
                    className={`${styles.barFill} ${index === 0 ? styles.barFillTop : ''}`}
                    style={{ height: `${Math.max(6, ((row.totalViews || 0) / maxViews) * 100)}%` }}
                  />
                  <span className={styles.barLabel}>{row.title}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className={ui.card}>
          <h2 className={ui.cardTitle}>Бюджет под контролем</h2>
          <p className={styles.budgetValue}>
            {campaigns.loading ? '…' : formatRubles(remaining)}
          </p>
          <p className={styles.budgetNote}>Осталось в активных кампаниях</p>
          <div className={ui.track} aria-hidden="true">
            <div className={ui.fill} style={{ width: `${usedPercent}%` }} />
          </div>
          <p className={styles.budgetNote}>Использовано {usedPercent}% бюджета</p>
          <p className={styles.budgetNote}>
            {wallet.loading
              ? 'Кошелёк: …'
              : wallet.error
                ? errorMessage(wallet.error, 'Кошелёк недоступен')
                : `Свободно в кошельке: ${formatRubles(wallet.data?.balanceKopecks ?? 0)}`}
          </p>
          <Link to="/app/wallet" className={`${ui.btnSecondary} ${ui.btnBlock}`}>
            Управлять бюджетом
          </Link>
        </section>
      </div>

      <div className={ui.sectionHead}>
        <h2 className={ui.sectionTitle}>Активные кампании</h2>
        <Link to="/app/campaigns" className={ui.sectionLink}>
          Все кампании →
        </Link>
      </div>
      <section className={ui.card}>
        {campaigns.loading ? (
          <p className={ui.message}>Загрузка кампаний…</p>
        ) : active.length === 0 ? (
          <div className={ui.empty}>
            <p className={ui.emptyTitle}>Активных кампаний нет</p>
            <p className={ui.emptyText}>
              Создайте первую: опишите задачу, задайте ставку и бюджет. Креаторы увидят её в офферах.
            </p>
            <Link to="/app/campaigns/new" className={ui.btnPrimary}>
              Создать кампанию
            </Link>
          </div>
        ) : (
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Кампания</th>
                  <th>Просмотры</th>
                  <th>Расход</th>
                  <th>Отклики</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {active.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link to={`/app/campaigns/${row.id}`} className={styles.rowLink}>
                        {row.title}
                      </Link>
                    </td>
                    <td>{formatViews(row.totalViews ?? 0)}</td>
                    <td className={ui.money}>{formatRubles(row.spentKopecks ?? 0)}</td>
                    <td>{row.applicationsCount ?? 0}</td>
                    <td>
                      <span className={STATUS_CHIP[row.status] || ui.chipOutline}>
                        {row.statusDescription || CAMPAIGN_STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerHome;

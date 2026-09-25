import React from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { SECTIONS, getAllowedSections } from '../../permissions';
import { errorMessage } from '../../shared/auth';
import { formatRubles, formatViews } from '../../shared/money';
import { ROLE_LABELS } from '../../shared/dictionaries';
import { useRequest } from './useRequest';
import Skeleton from '../shared/Skeleton/Skeleton';
import {
  applicationStats,
  asList,
  awaitingPayoutConfirmations,
  awaitingWalletOperations,
  campaignStats,
  customerWalletStats,
  exhaustedCampaigns,
  payoutStats,
  pendingPayouts,
  plural,
  topUpsOnReview,
} from './homeStats';
import ui from '../../shared/ui.module.css';
import styles from './AppHome.module.css';

const PRIMARY_ACTIONS = [
  { section: SECTIONS.CAMPAIGNS, to: '/app/campaigns/new', label: '+ Создать кампанию' },
  { section: SECTIONS.APPLICATIONS, to: '/app/board', label: 'Офферы' },
  { section: SECTIONS.FINANCE, to: '/app/finance/payouts', label: 'Выплаты' },
  { section: SECTIONS.USERS, to: '/app/admin/users', label: 'Пользователи' },
];

const LOADERS = {
  campaigns: () => apiClient.api.myCampaigns(),
  wallet: () => apiClient.api.myWallet(),
  walletOperations: () => apiClient.api.myWalletOperations(),
  applications: () => apiClient.api.myApplications(),
  earnings: () => apiClient.api.myEarnings(),
  operations: () => apiClient.api.myOperations(),
  payouts: () => apiClient.api.financePayouts(),
  topUps: () => apiClient.api.financeTopUps(),
  customers: () => apiClient.api.financeCustomers(),
};

const STRIPS = [
  {
    key: 'campaigns',
    section: SECTIONS.CAMPAIGNS,
    title: 'Кампании',
    to: '/app/campaigns',
    empty: 'Кампаний пока нет.',
    isEmpty: (data) => asList(data).length === 0,
    cells: (data) => {
      const stats = campaignStats(data);
      return [
        { label: 'активных', value: String(stats.active) },
        { label: 'откликов', value: String(stats.applications) },
        { label: 'просмотров', value: formatViews(stats.views) },
      ];
    },
  },
  {
    key: 'wallet',
    section: SECTIONS.WALLET,
    title: 'Кошелёк',
    to: '/app/wallet',
    cells: (data) => [
      { label: 'свободно', value: formatRubles(data?.balanceKopecks ?? 0), tone: 'good' },
      { label: 'в кампаниях', value: formatRubles(data?.allocatedKopecks ?? 0) },
      { label: 'начислено креаторам', value: formatRubles(data?.spentKopecks ?? 0) },
    ],
  },
  {
    key: 'applications',
    section: SECTIONS.APPLICATIONS,
    title: 'Работы',
    to: '/app/applications',
    empty: 'Работ пока нет.',
    isEmpty: (data) => asList(data).length === 0,
    cells: (data) => {
      const stats = applicationStats(data);
      return [
        { label: 'в работе', value: String(stats.approved) },
        { label: 'ждут решения', value: String(stats.pending) },
        { label: 'просмотров', value: formatViews(stats.views) },
      ];
    },
  },
  {
    key: 'earnings',
    section: SECTIONS.EARNINGS,
    title: 'Заработок',
    to: '/app/earnings',
    cells: (data) => [
      { label: 'к выводу', value: formatRubles(data?.balanceKopecks ?? 0), tone: 'good' },
      { label: 'ждёт зачисления', value: formatRubles(data?.pendingKopecks ?? 0) },
      { label: 'выведено', value: formatRubles(data?.paidOutKopecks ?? 0) },
    ],
  },
  {
    key: 'payouts',
    section: SECTIONS.FINANCE,
    title: 'Выплаты',
    to: '/app/finance/payouts',
    empty: 'Заявок на вывод пока не было.',
    isEmpty: (data) => asList(data).length === 0,
    cells: (data) => {
      const stats = payoutStats(data);
      return [
        { label: 'в работе', value: String(stats.open), tone: stats.open > 0 ? 'accent' : '' },
        { label: 'на сумму', value: formatRubles(stats.openKopecks) },
        { label: 'выплачено', value: formatRubles(stats.paidKopecks) },
      ];
    },
  },
  {
    key: 'customers',
    section: SECTIONS.FINANCE,
    title: 'Кошельки заказчиков',
    to: '/app/finance',
    empty: 'Кошельков пока нет.',
    isEmpty: (data) => asList(data).length === 0,
    cells: (data) => {
      const stats = customerWalletStats(data);
      return [
        { label: 'заказчиков', value: String(stats.customers) },
        { label: 'свободно', value: formatRubles(stats.balanceKopecks), tone: 'good' },
        { label: 'в кампаниях', value: formatRubles(stats.allocatedKopecks) },
      ];
    },
  },
];

const TONE_CLASS = { good: ui.success, accent: ui.accent };

const Strip = ({ strip, state }) => {
  const { data, error, loading } = state;
  const cells = strip.cells(data);
  return (
    <Link to={strip.to} className={styles.strip} aria-busy={loading || undefined}>
      <span className={styles.stripTitle}>{strip.title}</span>
      {error ? (
        <p className={ui.errorText}>{errorMessage(error, 'Не удалось загрузить')}</p>
      ) : !loading && strip.isEmpty?.(data) ? (
        <p className={styles.stripEmpty}>{strip.empty}</p>
      ) : (
        <div className={styles.stripCells}>
          {cells.map((cell) => (
            <div key={cell.label} className={styles.stripCell}>
              <span className={styles.stripLabel}>{cell.label}</span>
              <span className={`${styles.stripValue} ${loading ? '' : TONE_CLASS[cell.tone] || ''}`}>
                {loading ? <Skeleton width="5ch" /> : cell.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </Link>
  );
};

const GenericHome = () => {
  const jwtMeta = apiClient.getJwtMetadata();
  const role = jwtMeta?.role;
  const userName = jwtMeta?.name;
  const allowed = getAllowedSections(role);
  const has = (section) => allowed.includes(section);

  const campaigns = useRequest(has(SECTIONS.CAMPAIGNS), LOADERS.campaigns);
  const wallet = useRequest(has(SECTIONS.WALLET), LOADERS.wallet);
  const walletOperations = useRequest(has(SECTIONS.WALLET), LOADERS.walletOperations);
  const applications = useRequest(has(SECTIONS.APPLICATIONS), LOADERS.applications);
  const earnings = useRequest(has(SECTIONS.EARNINGS), LOADERS.earnings);
  const operations = useRequest(has(SECTIONS.EARNINGS), LOADERS.operations);
  const payouts = useRequest(has(SECTIONS.FINANCE), LOADERS.payouts);
  const topUps = useRequest(has(SECTIONS.FINANCE), LOADERS.topUps);
  const customers = useRequest(has(SECTIONS.FINANCE), LOADERS.customers);

  const states = { campaigns, wallet, applications, earnings, payouts, customers };
  const strips = STRIPS.filter((strip) => has(strip.section));
  const primary = PRIMARY_ACTIONS.find((action) => has(action.section));

  const attention = [];
  const settled = [walletOperations, campaigns, operations, payouts, topUps].every((s) => !s.loading);
  if (settled) {
    const awaitingOps = awaitingWalletOperations(walletOperations.data);
    if (awaitingOps > 0) {
      attention.push({
        to: '/app/wallet',
        count: awaitingOps,
        text: `${plural(awaitingOps, ['операция ждёт', 'операции ждут', 'операций ждут'])} вашего действия`,
      });
    }
    const exhausted = exhaustedCampaigns(campaigns.data);
    if (exhausted > 0) {
      attention.push({
        to: '/app/campaigns',
        count: exhausted,
        text: `${plural(exhausted, ['кампания исчерпала', 'кампании исчерпали', 'кампаний исчерпали'])} бюджет`,
      });
    }
    const awaitingPayouts = awaitingPayoutConfirmations(operations.data);
    if (awaitingPayouts > 0) {
      attention.push({
        to: '/app/earnings',
        count: awaitingPayouts,
        text: `${plural(awaitingPayouts, ['выплата ждёт', 'выплаты ждут', 'выплат ждут'])} вашего подтверждения`,
      });
    }
    const pending = pendingPayouts(payouts.data);
    if (pending > 0) {
      attention.push({
        to: '/app/finance/payouts',
        count: pending,
        text: `${plural(pending, ['выплата ждёт', 'выплаты ждут', 'выплат ждут'])} отправки`,
      });
    }
    const reviewing = topUpsOnReview(topUps.data);
    if (reviewing > 0) {
      attention.push({
        to: '/app/finance/top-ups',
        count: reviewing,
        text: `${plural(reviewing, ['пополнение ждёт', 'пополнения ждут', 'пополнений ждут'])} проверки`,
      });
    }
  }

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>{ROLE_LABELS[role] || 'Кабинет'}</span>
          <h1 className={ui.title}>{userName ? `Привет, ${userName}` : 'Привет'}</h1>
          <p className={ui.subtitle}>Состояние разделов и очередь на ваше действие.</p>
        </div>
        {primary && (
          <div className={ui.pageHeadActions}>
            <Link to={primary.to} className={ui.btnPrimary}>
              {primary.label}
            </Link>
          </div>
        )}
      </header>

      {strips.length === 0 && <p className={ui.message}>Для вашей роли разделов пока нет.</p>}

      {attention.map((row) => (
        <Link key={row.to} to={row.to} className={styles.attention}>
          <span className={styles.attentionCount}>{row.count}</span>
          <span>{row.text}</span>
          <span className={styles.attentionArrow}>→</span>
        </Link>
      ))}

      {strips.length > 0 && (
        <div className={ui.grid2}>
          {strips.map((strip) => (
            <Strip key={strip.key} strip={strip} state={states[strip.key]} />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenericHome;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { SECTIONS, getAllowedSections } from '../../permissions';
import { errorMessage } from '../../shared/auth';
import { formatRubles, formatViews } from '../../shared/money';
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
} from './homeStats';
import styles from './AppHome.module.css';

// Домашняя страница не дублирует сайдбар: она показывает состояние кабинета
// (несколько больших чисел на раздел) и очередь на действие пользователя.
// Навигация — в сайдбаре, поэтому плиток-ссылок здесь нет.

// Главное действие роли — первое подходящее по её секциям.
const PRIMARY_ACTIONS = [
  { section: SECTIONS.CAMPAIGNS, to: '/app/campaigns/new', label: 'Новое объявление' },
  { section: SECTIONS.APPLICATIONS, to: '/app/board', label: 'Доска объявлений' },
  { section: SECTIONS.FINANCE, to: '/app/finance/payouts', label: 'Выплаты' },
  { section: SECTIONS.USERS, to: '/app/admin/users', label: 'Пользователи и роли' },
];

// Загрузчики вынесены на уровень модуля, чтобы их идентичность не менялась
// между рендерами и эффект в useRequest не перезапускался.
const LOADERS = {
  campaigns: () => apiClient.api.myCampaigns(),
  wallet: () => apiClient.api.myWallet(),
  walletOperations: () => apiClient.api.myWalletOperations(),
  applications: () => apiClient.api.myApplications(),
  earnings: () => apiClient.api.myEarnings(),
  operations: () => apiClient.api.myOperations(),
  payouts: () => apiClient.api.financePayouts(),
  customers: () => apiClient.api.financeCustomers(),
};

/**
 * Один запрос — одно состояние. При enabled=false сеть не трогаем и сразу
 * отдаём «пусто, не грузится», чтобы хуки можно было звать безусловно.
 */
const useRequest = (enabled, loader) => {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });

  useEffect(() => {
    if (!enabled) return undefined;
    // Флаг отмены: ответ, пришедший после ухода со страницы, не должен
    // трогать state размонтированного компонента.
    let cancelled = false;
    loader()
      .then((res) => {
        if (!cancelled) setState({ data: res.data, error: null, loading: false });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, error: err, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, loader]);

  return state;
};

// Полосы состояния в порядке сайдбара. `cells` считает ячейки по данным,
// `isEmpty` — когда вместо ячеек показать подсказку для нового пользователя.
// Деньги-полосы (кошелёк, заработок) пустого состояния не имеют: нули — это информация.
const STRIPS = [
  {
    key: 'campaigns',
    section: SECTIONS.CAMPAIGNS,
    title: 'объявления',
    to: '/app/campaigns',
    empty: 'Объявлений пока нет — начните с первого.',
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
    title: 'кошелёк',
    to: '/app/wallet',
    cells: (data) => [
      { label: 'свободно', value: formatRubles(data?.balanceKopecks ?? 0), tone: 'good' },
      { label: 'в объявлениях', value: formatRubles(data?.allocatedKopecks ?? 0) },
      { label: 'начислено креаторам', value: formatRubles(data?.spentKopecks ?? 0) },
    ],
  },
  {
    key: 'applications',
    section: SECTIONS.APPLICATIONS,
    title: 'отклики',
    to: '/app/applications',
    empty: 'Откликов пока нет — подключите соцсети и выберите объявление на доске.',
    isEmpty: (data) => asList(data).length === 0,
    cells: (data) => {
      const stats = applicationStats(data);
      return [
        { label: 'в работе', value: String(stats.approved) },
        { label: 'на рассмотрении', value: String(stats.pending) },
        { label: 'просмотров', value: formatViews(stats.views) },
      ];
    },
  },
  {
    key: 'earnings',
    section: SECTIONS.EARNINGS,
    title: 'заработок',
    to: '/app/earnings',
    cells: (data) => [
      { label: 'доступно к выводу', value: formatRubles(data?.balanceKopecks ?? 0), tone: 'good' },
      { label: 'ждёт зачисления', value: formatRubles(data?.pendingKopecks ?? 0) },
      { label: 'выведено', value: formatRubles(data?.paidOutKopecks ?? 0) },
    ],
  },
  {
    key: 'payouts',
    section: SECTIONS.FINANCE,
    title: 'выплаты',
    to: '/app/finance/payouts',
    empty: 'Заявок на вывод пока не было.',
    isEmpty: (data) => asList(data).length === 0,
    cells: (data) => {
      const stats = payoutStats(data);
      return [
        { label: 'в работе', value: String(stats.open), tone: stats.open > 0 ? 'queueActive' : 'queue' },
        { label: 'на сумму', value: formatRubles(stats.openKopecks) },
        { label: 'выплачено', value: formatRubles(stats.paidKopecks) },
      ];
    },
  },
  {
    key: 'customers',
    section: SECTIONS.FINANCE,
    title: 'кошельки заказчиков',
    to: '/app/finance',
    empty: 'Кошельков пока нет.',
    isEmpty: (data) => asList(data).length === 0,
    cells: (data) => {
      const stats = customerWalletStats(data);
      return [
        { label: 'заказчиков', value: String(stats.customers) },
        { label: 'свободно', value: formatRubles(stats.balanceKopecks), tone: 'good' },
        { label: 'в объявлениях', value: formatRubles(stats.allocatedKopecks) },
      ];
    },
  },
];

const Strip = ({ strip, state }) => {
  const { data, error, loading } = state;
  const cells = strip.cells(data);

  let body;
  if (error) {
    body = <p className={styles.error}>{errorMessage(error, 'Не удалось загрузить')}</p>;
  } else if (!loading && strip.isEmpty?.(data)) {
    body = <p className={styles.empty}>{strip.empty}</p>;
  } else {
    body = (
      <div className={styles.items}>
        {cells.map((cell) => (
          <div key={cell.label} className={styles.item}>
            <span className={styles.label}>{cell.label}</span>
            <span
              className={`${styles.value} ${
                loading ? styles.pending : cell.tone ? styles[cell.tone] : ''
              }`}
            >
              {loading ? '…' : cell.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Link to={strip.to} className={styles.strip} aria-busy={loading || undefined}>
      <span className={styles.stripTitle}>{strip.title}</span>
      {body}
    </Link>
  );
};

const AppHome = () => {
  const jwtMeta = apiClient.getJwtMetadata();
  const role = jwtMeta?.role;
  // Только имя: логин/почта капсом в плакатном H1 выглядит как ошибка, лучше просто «Привет».
  const userName = jwtMeta?.name;
  const allowed = getAllowedSections(role);
  const has = (section) => allowed.includes(section);

  // Хуки безусловные: по одному на эндпоинт, включение — по секции роли.
  const campaigns = useRequest(has(SECTIONS.CAMPAIGNS), LOADERS.campaigns);
  const wallet = useRequest(has(SECTIONS.WALLET), LOADERS.wallet);
  const walletOperations = useRequest(has(SECTIONS.WALLET), LOADERS.walletOperations);
  const applications = useRequest(has(SECTIONS.APPLICATIONS), LOADERS.applications);
  const earnings = useRequest(has(SECTIONS.EARNINGS), LOADERS.earnings);
  const operations = useRequest(has(SECTIONS.EARNINGS), LOADERS.operations);
  const payouts = useRequest(has(SECTIONS.FINANCE), LOADERS.payouts);
  const customers = useRequest(has(SECTIONS.FINANCE), LOADERS.customers);

  const states = { campaigns, wallet, applications, earnings, payouts, customers };
  const strips = STRIPS.filter((strip) => has(strip.section));
  const primary = PRIMARY_ACTIONS.find((action) => has(action.section));

  // Очередь на моё действие. Карточка появляется только когда все её источники
  // ответили (успехом или ошибкой), иначе строки будут появляться по одной и мигать.
  // Упавший источник просто не даёт строк — у него нет своего баннера.
  const attentionSources = [walletOperations, campaigns, operations, payouts];
  const attentionSettled = attentionSources.every((source) => !source.loading);
  const attention = [];
  if (attentionSettled) {
    const awaitingOps = awaitingWalletOperations(walletOperations.data);
    if (awaitingOps > 0) {
      attention.push({
        to: '/app/wallet',
        count: awaitingOps,
        text: `${plural(awaitingOps, ['операция ждёт', 'операции ждут', 'операций ждут'])} вашего подтверждения`,
      });
    }
    const exhausted = exhaustedCampaigns(campaigns.data);
    if (exhausted > 0) {
      attention.push({
        to: '/app/campaigns',
        count: exhausted,
        text: `${plural(exhausted, ['объявление исчерпало', 'объявления исчерпали', 'объявлений исчерпали'])} бюджет`,
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
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>{userName ? `Привет, ${userName}` : 'Привет'}</h1>
        {primary && (
          <Link to={primary.to} className={styles.primaryBtn}>
            {primary.label}
          </Link>
        )}
      </div>

      {strips.length === 0 && (
        <p className={styles.message}>Для вашей роли разделов пока нет.</p>
      )}

      {attention.length > 0 && (
        <section className={styles.attention} aria-labelledby="home-attention-title">
          <h2 id="home-attention-title" className={styles.attentionTitle}>требует внимания</h2>
          {attention.map((row) => (
            <Link key={row.to} to={row.to} className={styles.attentionRow}>
              <span className={styles.attentionCount}>{row.count}</span>
              <span className={styles.attentionText}>{row.text}</span>
            </Link>
          ))}
        </section>
      )}

      {strips.length > 0 && (
        <div className={styles.strips}>
          {strips.map((strip) => (
            <Strip key={strip.key} strip={strip} state={states[strip.key]} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppHome;

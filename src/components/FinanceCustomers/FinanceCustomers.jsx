import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import FitRubles from '../shared/FitRubles/FitRubles';
import Skeleton, { SkeletonTableRows } from '../shared/Skeleton/Skeleton';
import ui from '../../shared/ui.module.css';
import styles from './FinanceCustomers.module.css';

const SKELETON_COLUMNS = [
  { width: '14ch', lines: 2 },
  { width: '8ch', className: ui.right },
  { width: '8ch', className: ui.right },
  { width: '8ch', className: ui.right },
  { width: '8ch', className: ui.right },
];

const matches = (wallet, query) =>
  [wallet.customerName, wallet.customerEmail, wallet.customerCompany]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query));

const FinanceCustomers = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [query, setQuery] = useState('');

  const loadWallets = useCallback(async () => {
    try {
      const res = await apiClient.api.financeCustomers();
      setWallets(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить кошельки'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = useMemo(
    () => (normalizedQuery ? wallets.filter((wallet) => matches(wallet, normalizedQuery)) : wallets),
    [wallets, normalizedQuery]
  );

  const totals = useMemo(
    () =>
      wallets.reduce(
        (sum, wallet) => ({
          balance: sum.balance + (wallet.balanceKopecks || 0),
          allocated: sum.allocated + (wallet.allocatedKopecks || 0),
          spent: sum.spent + (wallet.spentKopecks || 0),
        }),
        { balance: 0, allocated: 0, spent: 0 }
      ),
    [wallets]
  );

  const amount = (kopecks, className) =>
    loading ? (
      <span className={className}>
        <Skeleton width="7ch" />
      </span>
    ) : (
      <FitRubles className={className} kopecks={kopecks} />
    );

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Финансы</span>
          <h1 className={ui.title}>Кошельки рекламодателей</h1>
          <p className={ui.subtitle}>
            Свободные остатки, резервы в кампаниях и начисления креаторам по каждому рекламодателю.
          </p>
        </div>
        <div className={ui.pageHeadActions}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${ui.input} ${styles.search}`}
            placeholder="Имя, почта или компания"
            aria-label="Поиск по имени, почте или компании"
          />
        </div>
      </header>

      {pageError && <p className={ui.errorBanner}>{pageError}</p>}

      <div className={`${ui.grid4} ${styles.totals}`} aria-busy={loading || undefined}>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Рекламодателей</span>
          <span className={ui.statValue}>{loading ? <Skeleton width="3ch" /> : wallets.length}</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Свободно всего</span>
          {amount(totals.balance, `${ui.statValue} ${ui.success}`)}
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>В кампаниях</span>
          {amount(totals.allocated, ui.statValue)}
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Начислено креаторам</span>
          {amount(totals.spent, ui.statValue)}
        </div>
      </div>

      <section className={ui.card}>
        {!loading && visible.length === 0 ? (
          <p className={ui.message}>
            {normalizedQuery ? 'Никого не нашлось по запросу.' : 'Рекламодателей с кошельком пока нет.'}
          </p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Рекламодатель</th>
                  <th className={ui.right}>Свободно</th>
                  <th className={ui.right}>В кампаниях</th>
                  <th className={ui.right}>Начислено</th>
                  <th />
                </tr>
              </thead>
              <tbody aria-busy={loading || undefined}>
                {loading && <SkeletonTableRows columns={SKELETON_COLUMNS} />}
                {visible.map((wallet) => (
                  <tr key={wallet.userId}>
                    <td>
                      <div className={styles.who}>
                        <Link to={`/app/finance/${wallet.userId}`} className={styles.name}>
                          {wallet.customerName || wallet.customerEmail}
                        </Link>
                        <span className={styles.email}>{wallet.customerEmail}</span>
                        {wallet.customerCompany && (
                          <span className={styles.company}>{wallet.customerCompany}</span>
                        )}
                      </div>
                    </td>
                    <td className={`${ui.right} ${ui.money} ${ui.success}`}>
                      {formatRubles(wallet.balanceKopecks ?? 0)}
                    </td>
                    <td className={`${ui.right} ${ui.money}`}>
                      {formatRubles(wallet.allocatedKopecks ?? 0)}
                    </td>
                    <td className={`${ui.right} ${ui.money}`}>
                      {formatRubles(wallet.spentKopecks ?? 0)}
                    </td>
                    <td className={ui.right}>
                      <Link to={`/app/finance/${wallet.userId}`} className={ui.linkAccent}>
                        Открыть →
                      </Link>
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

export default FinanceCustomers;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import styles from './FinanceCustomers.module.css';
import Field from '../shared/Field/Field';

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

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>Кошельки заказчиков</h1>
        <Field label="Имя, почта или компания" className={styles.searchField} pill>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.search}
          />
        </Field>
      </div>

      {pageError && <p className={styles.banner}>{pageError}</p>}

      <div className={styles.totals}>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>заказчиков</span>
          <span className={styles.totalValue}>{wallets.length}</span>
        </div>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>свободно всего</span>
          <span className={`${styles.totalValue} ${styles.totalFree}`}>
            {formatRubles(totals.balance)}
          </span>
        </div>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>в объявлениях</span>
          <span className={styles.totalValue}>{formatRubles(totals.allocated)}</span>
        </div>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>начислено криаторам</span>
          <span className={styles.totalValue}>{formatRubles(totals.spent)}</span>
        </div>
      </div>

      {loading ? (
        <p className={styles.message}>Загрузка кошельков…</p>
      ) : visible.length === 0 ? (
        <p className={styles.message}>
          {normalizedQuery ? 'Никого не нашлось по запросу.' : 'Заказчиков с кошельком пока нет.'}
        </p>
      ) : (
        <ul className={styles.list}>
          {visible.map((wallet) => (
            <li key={wallet.userId} className={styles.item}>
              <Link to={`/app/finance/${wallet.userId}`} className={styles.itemLink}>
                <div className={styles.who}>
                  <span className={styles.name}>{wallet.customerName || wallet.customerEmail}</span>
                  <span className={styles.email}>{wallet.customerEmail}</span>
                  {wallet.customerCompany && (
                    <span className={styles.company}>{wallet.customerCompany}</span>
                  )}
                </div>
                <div className={styles.money}>
                  <span className={styles.moneyItem}>
                    <span className={styles.moneyLabel}>свободно</span>
                    <span className={`${styles.moneyValue} ${styles.moneyFree}`}>
                      {formatRubles(wallet.balanceKopecks ?? 0)}
                    </span>
                  </span>
                  <span className={styles.moneyItem}>
                    <span className={styles.moneyLabel}>в объявлениях</span>
                    <span className={styles.moneyValue}>
                      {formatRubles(wallet.allocatedKopecks ?? 0)}
                    </span>
                  </span>
                  <span className={styles.moneyItem}>
                    <span className={styles.moneyLabel}>начислено</span>
                    <span className={styles.moneyValue}>
                      {formatRubles(wallet.spentKopecks ?? 0)}
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FinanceCustomers;

import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../../apiClient';
import walletApi from '../../shared/walletApi';
import { formatRubles } from '../../shared/money';
import WalletHistory from '../shared/WalletHistory/WalletHistory';
import styles from './Wallet.module.css';

const ROLE_COPY = {
  CUSTOMER: 'Баланс заказчика. Сейчас его вручную пополняет менеджер. Списание по заказам в эту версию не подключено.',
  CREATOR: 'Баланс криатора. Сейчас изменения выполняет менеджер. Автоматические начисления по заказам в эту версию не подключены.',
};

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const role = apiClient.getJwtMetadata()?.role;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [walletData, transactionData] = await Promise.all([
        walletApi.getCurrent(),
        walletApi.getCurrentTransactions(),
      ]);
      setWallet(walletData);
      setTransactions(Array.isArray(transactionData) ? transactionData : []);
      setPageError('');
    } catch (err) {
      setPageError(err?.response?.data?.message || err?.message || 'Не удалось загрузить кошелёк');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>финансы</p>
          <h1 className={styles.title}>Кошелёк</h1>
        </div>
      </div>

      {pageError && <p className={styles.banner}>{pageError}</p>}

      {loading ? (
        <p className={styles.message}>Загрузка кошелька…</p>
      ) : wallet ? (
        <>
          <section className={styles.balanceCard} aria-label="Текущий баланс">
            <p className={styles.balanceLabel}>Доступный баланс</p>
            <p className={styles.balance}>{formatRubles(wallet.balanceKopecks)}</p>
            <p className={styles.balanceHint}>{ROLE_COPY[role] || 'Текущий баланс кошелька.'}</p>
          </section>

          <section className={styles.historySection}>
            <div className={styles.sectionHead}>
              <div>
                <p className={styles.eyebrow}>аудит</p>
                <h2 className={styles.sectionTitle}>История операций</h2>
              </div>
              <button type="button" className={styles.refreshBtn} onClick={load}>
                Обновить
              </button>
            </div>
            <WalletHistory
              transactions={transactions}
              emptyText="Менеджер ещё не менял баланс этого кошелька."
            />
          </section>
        </>
      ) : null}
    </div>
  );
};

export default Wallet;

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import WalletSummary from '../shared/WalletSummary/WalletSummary';
import OperationRows from '../shared/OperationRows/OperationRows';
import { errorMessage } from '../../shared/auth';
import { formatDate } from '../../shared/dictionaries';
import styles from './CustomerWallet.module.css';

const CustomerWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [transactionsError, setTransactionsError] = useState('');

  const loadWallet = useCallback(async () => {
    try {
      const res = await apiClient.api.myWallet();
      setWallet(res.data);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить кошелёк'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await apiClient.api.myWalletOperations();
      setTransactions(Array.isArray(res.data) ? res.data : []);
      setTransactionsError('');
    } catch (err) {
      setTransactionsError(errorMessage(err, 'Не удалось загрузить операции'));
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, [loadWallet, loadTransactions]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.topUpTronAddress);
      toast.success('Адрес скопирован');
    } catch {
      toast.error('Не удалось скопировать — выделите адрес вручную');
    }
  };

  const awaiting = transactions.filter(
    (row) => row.status === 'SENT' && (row.type === 'TOP_UP' || row.type === 'WITHDRAWAL')
  ).length;

  if (loading) {
    return (
      <div className={styles.wrap}>
        <p className={styles.message}>Загрузка кошелька…</p>
      </div>
    );
  }

  if (pageError && !wallet) {
    return (
      <div className={styles.wrap}>
        <p className={styles.banner}>{pageError}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h1 className={styles.title}>Кошелёк</h1>
        <Link to="/app/campaigns/new" className={styles.primaryBtn}>
          Новое объявление
        </Link>
      </div>
      {wallet?.updatedAt && (
        <p className={styles.subtitle}>обновлён {formatDate(wallet.updatedAt)}</p>
      )}

      <WalletSummary wallet={wallet} />

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Как это работает</h2>
        <p className={styles.text}>
          Свободные деньги вы распределяете между объявлениями: бюджет объявления
          резервируется из кошелька при создании, а если бюджет уменьшить — разница
          возвращается обратно. Ниже суммы уже начисленного криаторам бюджет опустить нельзя.
        </p>
        <p className={styles.text}>
          Пополнение и вывод проводит менеджер финансов в USDT (TRC-20): к каждой операции он
          прикладывает скриншот и номер транзакции, а вам остаётся открыть её в истории, сверить
          и подтвердить.
        </p>
        {wallet?.topUpTronAddress && (
          <p className={styles.text}>
            Пополнить: переведите USDT (TRC-20) на адрес платформы{' '}
            <code className={styles.address}>{wallet.topUpTronAddress}</code>{' '}
            <button type="button" className={styles.copyBtn} onClick={copyAddress}>
              копировать
            </button>{' '}
            и сообщите менеджеру финансов номер транзакции.
          </p>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Операции</h2>
        {awaiting > 0 && (
          <p className={styles.awaiting}>
            Ждут вашего подтверждения: {awaiting}. Откройте операцию, сверьте перевод и
            подтвердите.
          </p>
        )}
        <OperationRows
          rows={transactions}
          loading={transactionsLoading}
          error={transactionsError}
          linkFor={(row) => `/app/wallet/${row.id}`}
          emptyText="Операций по кошельку пока не было."
        />
      </section>
    </div>
  );
};

export default CustomerWallet;

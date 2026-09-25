import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import OperationRows from '../shared/OperationRows/OperationRows';
import Icon from '../shared/Icon/Icon';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import { formatDate } from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';
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
      <div className={ui.page}>
        <p className={ui.message}>Загрузка кошелька…</p>
      </div>
    );
  }

  if (pageError && !wallet) {
    return (
      <div className={ui.page}>
        <p className={ui.errorBanner}>{pageError}</p>
      </div>
    );
  }

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Рекламодатель</span>
          <h1 className={ui.title}>Финансы</h1>
          <p className={ui.subtitle}>
            Баланс, резерв под кампании и операции
            {wallet?.updatedAt ? ` · обновлено ${formatDate(wallet.updatedAt)}` : ''}
          </p>
        </div>
        <div className={`${ui.pageHeadActions} ${styles.headActions}`}>
          <Link to="/app/campaigns/new" className={ui.btnPrimary}>
            + Создать кампанию
          </Link>
        </div>
      </header>

      {pageError && <p className={ui.errorBanner}>{pageError}</p>}

      <div className={styles.top}>
        <section className={styles.balance}>
          <span className={styles.balanceLabel}>Свободно в кошельке</span>
          <span className={styles.balanceValue}>{formatRubles(wallet?.balanceKopecks ?? 0)}</span>
          <span className={styles.balanceNote}>
            Бюджет кампании резервируется из кошелька при создании
          </span>
        </section>

        <div className={styles.stats}>
          <div className={ui.stat}>
            <span className={ui.statLabel}>В кампаниях</span>
            <span className={ui.statValue}>{formatRubles(wallet?.allocatedKopecks ?? 0)}</span>
            <span className={ui.statNote}>зарезервировано под бюджеты</span>
          </div>
          <div className={ui.stat}>
            <span className={ui.statLabel}>Начислено креаторам</span>
            <span className={ui.statValue}>{formatRubles(wallet?.spentKopecks ?? 0)}</span>
            <span className={ui.statNote}>за подтверждённые просмотры</span>
          </div>
        </div>
      </div>

      <section className={`${ui.card} ${styles.topUp}`}>
        <div className={styles.topUpMain}>
          <h2 className={ui.cardTitle}>Как пополнить</h2>
          <p className={styles.text}>
            Переведите USDT (TRC-20) на адрес платформы и сообщите менеджеру финансов номер
            транзакции. Пополнение и вывод проводит менеджер: к операции он прикладывает
            скриншот и номер транзакции, вам остаётся сверить перевод и подтвердить его в
            истории.
          </p>
          {wallet?.topUpTronAddress && (
            <div className={styles.addressRow}>
              <code className={styles.address}>{wallet.topUpTronAddress}</code>
              <button
                type="button"
                className={`${ui.btnSecondary} ${ui.btnSmall}`}
                onClick={copyAddress}
              >
                <Icon name="copy" size={14} />
                Скопировать
              </button>
            </div>
          )}
        </div>
        <p className={styles.topUpAside}>
          Если бюджет кампании уменьшить, разница вернётся в кошелёк. Ниже суммы, уже
          начисленной креаторам, бюджет опустить нельзя.
        </p>
      </section>

      <div className={ui.sectionHead}>
        <h2 className={ui.sectionTitle}>История операций</h2>
      </div>
      <section className={ui.card}>
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

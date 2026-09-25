import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import OperationRows from '../shared/OperationRows/OperationRows';
import Field from '../shared/Field/Field';
import FieldError from '../shared/FieldError/FieldError';
import Icon from '../shared/Icon/Icon';
import { errorMessage } from '../../shared/auth';
import { formatRubInput, formatRubles, rubToKopecks } from '../../shared/money';
import { formatDate } from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';
import styles from './CustomerWallet.module.css';

const CustomerWallet = () => {
  const navigate = useNavigate();
  const amountRef = useRef(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [transactionsError, setTransactionsError] = useState('');
  const [amountRub, setAmountRub] = useState('');
  const [amountError, setAmountError] = useState('');
  const [creating, setCreating] = useState(false);

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

  const startTopUp = () => {
    amountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    amountRef.current?.focus({ preventScroll: true });
  };

  const createTopUp = async (e) => {
    e.preventDefault();
    const amountKopecks = rubToKopecks(amountRub);
    if (amountKopecks == null || amountKopecks <= 0) {
      setAmountError('Сумма в рублях, больше нуля');
      amountRef.current?.focus();
      return;
    }
    setCreating(true);
    setAmountError('');
    try {
      const res = await apiClient.api.requestTopUp({ amountKopecks });
      toast.success('Заявка создана — переведите USDT на адрес из заявки');
      navigate(`/app/wallet/${res.data.transaction.id}`);
    } catch (err) {
      setAmountError(errorMessage(err, 'Не удалось создать заявку'));
      setCreating(false);
    }
  };

  const unpaidTopUps = transactions.filter(
    (row) => row.type === 'TOP_UP' && row.status === 'PENDING'
  ).length;
  const awaitingWithdrawals = transactions.filter(
    (row) => row.type === 'WITHDRAWAL' && row.status === 'SENT'
  ).length;
  const onReviewKopecks = transactions
    .filter((row) => row.type === 'TOP_UP' && row.status === 'SENT')
    .reduce((sum, row) => sum + (row.amountKopecks || 0), 0);
  const topUpAvailable = Boolean(wallet?.topUpTronAddress);

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
          <button type="button" className={ui.btnPrimary} onClick={startTopUp}>
            <Icon name="plus" size={16} />
            Пополнить баланс
          </button>
        </div>
      </header>

      {pageError && <p className={ui.errorBanner}>{pageError}</p>}

      <div className={styles.top}>
        <section className={styles.balance}>
          <span className={styles.balanceLabel}>Свободно в кошельке</span>
          <span className={styles.balanceValue}>{formatRubles(wallet?.balanceKopecks ?? 0)}</span>
          <span className={styles.balanceNote}>
            {onReviewKopecks > 0
              ? `Ещё ${formatRubles(onReviewKopecks)} на проверке — зачислим, как только увидим перевод`
              : 'Бюджет кампании резервируется из кошелька при создании'}
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
        <form className={styles.topUpMain} onSubmit={createTopUp} noValidate>
          <h2 className={ui.cardTitle}>Пополнить баланс</h2>
          <ol className={styles.steps}>
            <li>Укажите сумму — заведём заявку на пополнение с адресом для оплаты.</li>
            <li>Переведите USDT (TRC-20) на этот адрес и приложите к заявке скриншот или PDF перевода.</li>
            <li>Финансист сверит поступление и зачислит деньги на баланс.</li>
          </ol>
          <div className={styles.topUpForm}>
            <Field label="Сумма, ₽" className={styles.amount}>
              <input
                ref={amountRef}
                type="text"
                inputMode="decimal"
                value={amountRub}
                onChange={(e) => {
                  setAmountRub(formatRubInput(e.target.value));
                  setAmountError('');
                }}
                className={ui.input}
                aria-invalid={amountError ? 'true' : undefined}
                autoComplete="off"
                disabled={creating || !topUpAvailable}
              />
              <FieldError>{amountError}</FieldError>
            </Field>
            <button
              type="submit"
              className={ui.btnPrimary}
              disabled={creating || !topUpAvailable}
            >
              {creating ? 'Создаём…' : 'Создать заявку'}
            </button>
          </div>
          {!topUpAvailable && (
            <p className={ui.hintWarn}>
              Адрес для пополнения ещё не настроен — напишите менеджеру финансов.
            </p>
          )}
        </form>
        <p className={styles.topUpAside}>
          Деньги появятся на балансе после проверки перевода. Пока заявка не оплачена, её можно
          отменить. Если уменьшить бюджет кампании, разница вернётся в кошелёк.
        </p>
      </section>

      <div className={ui.sectionHead}>
        <h2 className={ui.sectionTitle}>История операций</h2>
      </div>
      <section className={ui.card}>
        {unpaidTopUps > 0 && (
          <p className={styles.awaiting}>
            Ждут оплаты: {unpaidTopUps}. Откройте заявку, переведите USDT и приложите скриншот или
            PDF перевода.
          </p>
        )}
        {awaitingWithdrawals > 0 && (
          <p className={styles.awaiting}>
            Ждут вашего подтверждения: {awaitingWithdrawals}. Откройте вывод, проверьте поступление
            и подтвердите.
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

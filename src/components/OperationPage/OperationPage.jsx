import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import TransferCard from '../shared/TransferCard/TransferCard';
import Icon from '../shared/Icon/Icon';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import ui from '../../shared/ui.module.css';
import styles from './OperationPage.module.css';

const SCOPES = {
  earnings: {
    load: (id) => apiClient.api.myOperation(id),
    back: '/app/earnings',
    backLabel: 'К заработку',
    creatorActions: true,
  },
  wallet: {
    load: (id) => apiClient.api.myWalletOperation(id),
    back: '/app/wallet',
    backLabel: 'К кошельку',
    customerActions: true,
  },
  finance: {
    load: (id) => apiClient.api.financeOperation(id),
    back: '/app/finance/operations',
    backLabel: 'Ко всем операциям',
    showOwner: true,
    financeActions: true,
  },
};

const TITLES = {
  PAYOUT: 'Заявка на вывод',
  TOP_UP: 'Пополнение',
  WITHDRAWAL: 'Вывод',
};

const CONFIRM_TEXT = {
  TOP_UP: (amount) =>
    `Финансист зачислил ${amount} по вашему переводу. Сверьте номер транзакции и скриншоты и подтвердите операцию.`,
  WITHDRAWAL: (amount) =>
    `Финансист отправил ${amount} в USDT на ваш кошелёк TRON. Проверьте поступление и подтвердите получение.`,
};

const OperationPage = ({ scope = 'earnings' }) => {
  const { operationId } = useParams();
  const config = SCOPES[scope] || SCOPES.earnings;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await config.load(Number(operationId));
      setDetail(res.data);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить операцию'));
    } finally {
      setLoading(false);
    }
  }, [operationId, config]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const act = async (request, question, done) => {
    if (!window.confirm(question)) return;
    setBusy(true);
    try {
      const res = await request(Number(operationId));
      setDetail(res.data);
      toast.success(done);
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось выполнить действие'));
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    const reason = window.prompt(
      'Причина отклонения — её увидит рекламодатель. Деньги вернутся туда, откуда ушли.'
    );
    if (reason == null) return;
    if (!reason.trim()) {
      toast.error('Без причины отклонить нельзя');
      return;
    }
    setBusy(true);
    try {
      const res = await apiClient.api.rejectOperation(Number(operationId), { reason: reason.trim() });
      setDetail(res.data);
      toast.success('Операция отклонена');
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось отклонить операцию'));
    } finally {
      setBusy(false);
    }
  };

  const backLink = (
    <Link to={config.back} className={ui.backLink}>
      <Icon name="arrowLeft" size={16} />
      {config.backLabel}
    </Link>
  );

  if (loading) {
    return (
      <div className={`${ui.page} ${styles.narrow}`}>
        {backLink}
        <p className={ui.message}>Загрузка операции…</p>
      </div>
    );
  }

  if (pageError && !detail) {
    return (
      <div className={`${ui.page} ${styles.narrow}`}>
        {backLink}
        <p className={ui.errorBanner}>{pageError}</p>
      </div>
    );
  }

  const transaction = detail.transaction;
  const amount = formatRubles(Math.abs(transaction.amountKopecks ?? 0));
  const isPayout = transaction.type === 'PAYOUT';
  const isCustomerTransfer = transaction.type === 'TOP_UP' || transaction.type === 'WITHDRAWAL';

  return (
    <div className={`${ui.page} ${styles.narrow}`}>
      {backLink}
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Операция</span>
          <h1 className={ui.title}>{TITLES[transaction.type] || 'Операция'}</h1>
        </div>
      </header>

      <TransferCard detail={detail} showOwner={config.showOwner}>
        {config.creatorActions && isPayout && transaction.status === 'SENT' && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              Финансист отправил {amount} в USDT. Проверьте кошелёк и подтвердите получение.
            </p>
            <button
              type="button"
              className={ui.btnPrimary}
              disabled={busy}
              onClick={() =>
                act(
                  apiClient.api.confirmPayout,
                  `Подтверждаете, что получили ${amount} на свой кошелёк?`,
                  'Получение подтверждено'
                )
              }
            >
              {busy ? 'Подтверждаем…' : 'Подтвердить получение'}
            </button>
          </div>
        )}
        {config.creatorActions && isPayout && transaction.status === 'PENDING' && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              Заявка у финансиста. Пока он её не отправил, можно отменить — деньги вернутся в
              доступные.
            </p>
            <button
              type="button"
              className={ui.btnDanger}
              disabled={busy}
              onClick={() =>
                act(
                  apiClient.api.cancelPayout,
                  `Отменить заявку на ${amount}?`,
                  'Заявка отменена, деньги вернулись'
                )
              }
            >
              {busy ? 'Отменяем…' : 'Отменить заявку'}
            </button>
          </div>
        )}
        {config.customerActions && isCustomerTransfer && transaction.status === 'SENT' && (
          <div className={styles.actions}>
            <p className={styles.actionText}>{CONFIRM_TEXT[transaction.type](amount)}</p>
            <button
              type="button"
              className={ui.btnPrimary}
              disabled={busy}
              onClick={() =>
                act(
                  apiClient.api.confirmWalletOperation,
                  `Подтверждаете ${transaction.type === 'TOP_UP' ? 'пополнение' : 'вывод'} на ${amount}?`,
                  'Операция подтверждена'
                )
              }
            >
              {busy ? 'Подтверждаем…' : 'Подтвердить'}
            </button>
          </div>
        )}
        {config.financeActions && isCustomerTransfer && transaction.status === 'SENT' && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              Ждём подтверждения рекламодателя. Если перевод не сошёлся — отклоните операцию,
              деньги вернутся туда, откуда ушли.
            </p>
            <button type="button" className={ui.btnDanger} onClick={reject} disabled={busy}>
              {busy ? 'Отклоняем…' : 'Отклонить'}
            </button>
          </div>
        )}
        {config.financeActions && isPayout && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              Отправка USDT, скриншоты и отклонение — на странице заявки.
            </p>
            <Link to={`/app/finance/payouts/${transaction.id}`} className={ui.btnPrimary}>
              Открыть заявку →
            </Link>
          </div>
        )}
      </TransferCard>
    </div>
  );
};

export default OperationPage;

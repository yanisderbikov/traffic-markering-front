import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import TransferCard, { TransferCardSkeleton } from '../shared/TransferCard/TransferCard';
import { SkeletonPageHead } from '../shared/Skeleton/Skeleton';
import ProofUploader from '../shared/ProofUploader/ProofUploader';
import Field from '../shared/Field/Field';
import Icon from '../shared/Icon/Icon';
import UsdtQuote from '../shared/UsdtQuote/UsdtQuote';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import useCountdown, { formatCountdown } from '../../shared/useCountdown';
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
    backByType: { TOP_UP: { to: '/app/finance/top-ups', label: 'Ко всем пополнениям' } },
    showOwner: true,
    financeActions: true,
  },
};

const TITLES = {
  PAYOUT: 'Заявка на вывод',
  TOP_UP: 'Заявка на пополнение',
  WITHDRAWAL: 'Вывод',
};

const REJECT_PROMPT = {
  TOP_UP: 'Причина отклонения — её увидит рекламодатель. На баланс ничего не зачислится.',
};

const EXPIRY_SYNC_DELAY_MS = 35_000;
const TIMER_WARN_MS = 5 * 60_000;

const OperationPage = ({ scope = 'earnings' }) => {
  const { operationId } = useParams();
  const config = SCOPES[scope] || SCOPES.earnings;
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [busy, setBusy] = useState(false);
  const [proofs, setProofs] = useState([]);
  const [txId, setTxId] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await config.load(operationId);
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

  const awaitingPayment =
    detail?.transaction?.type === 'TOP_UP' && detail?.transaction?.status === 'PENDING';
  const awaitingConfirmation =
    detail?.transaction?.type === 'WITHDRAWAL' && detail?.transaction?.status === 'SENT';
  const remainingMs = useCountdown(
    awaitingPayment || awaitingConfirmation ? detail?.transfer?.expiresAt : null
  );
  const timeIsUp = remainingMs === 0;

  useEffect(() => {
    if (!timeIsUp) return undefined;
    const timer = setTimeout(load, EXPIRY_SYNC_DELAY_MS);
    return () => clearTimeout(timer);
  }, [timeIsUp, load]);

  const act = async (request, question, done) => {
    if (!window.confirm(question)) return;
    setBusy(true);
    try {
      const res = await request(operationId);
      setDetail(res.data);
      toast.success(done);
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось выполнить действие'));
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    if (!proofs.length) {
      toast.error('Приложите скриншот или PDF перевода');
      return;
    }
    if (!window.confirm('Отправить заявку на проверку? После этого отменить её не получится.')) return;
    setBusy(true);
    try {
      const res = await apiClient.api.markTopUpPaid(operationId, {
        txId: txId.trim() || undefined,
        proofKeys: proofs.map((proof) => proof.key),
      });
      setDetail(res.data);
      toast.success('Заявка отправлена на проверку');
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось отправить подтверждение оплаты'));
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    const reason = window.prompt(
      REJECT_PROMPT[detail?.transaction?.type] ||
        'Причина отклонения — её увидит рекламодатель. Деньги вернутся туда, откуда ушли.'
    );
    if (reason == null) return;
    if (!reason.trim()) {
      toast.error('Без причины отклонить нельзя');
      return;
    }
    setBusy(true);
    try {
      const res = await apiClient.api.rejectOperation(operationId, { reason: reason.trim() });
      setDetail(res.data);
      toast.success('Операция отклонена');
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось отклонить операцию'));
    } finally {
      setBusy(false);
    }
  };

  const back = config.backByType?.[detail?.transaction?.type] || {
    to: config.back,
    label: config.backLabel,
  };
  const backLink = (
    <Link to={back.to} className={ui.backLink}>
      <Icon name="arrowLeft" size={16} />
      {back.label}
    </Link>
  );

  if (loading) {
    return (
      <div className={`${ui.page} ${styles.narrow}`} aria-busy="true">
        {backLink}
        <SkeletonPageHead eyebrow="Операция" subtitle={false} />
        <TransferCardSkeleton />
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
  const isTopUp = transaction.type === 'TOP_UP';
  const isWithdrawal = transaction.type === 'WITHDRAWAL';
  const isOpen = transaction.status === 'PENDING' || transaction.status === 'SENT';
  const isExpired = transaction.status === 'EXPIRED' || timeIsUp;
  const timer = (label) =>
    remainingMs != null && (
      <div
        className={`${styles.timer} ${remainingMs <= TIMER_WARN_MS ? styles.timerWarn : ''}`}
        role="timer"
        aria-live="off"
      >
        <span className={styles.timerLabel}>{label}</span>
        <span className={styles.timerValue}>{formatCountdown(remainingMs)}</span>
      </div>
    );

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
        {config.customerActions && isTopUp && transaction.status === 'PENDING' && !timeIsUp && (
          <div className={styles.payment}>
            {timer('Оплатите и приложите чек за')}
            <p className={styles.actionText}>
              Переведите USDT (TRC-20) на сумму {amount} на адрес для оплаты выше. Затем приложите
              скриншот или PDF перевода — заявка уйдёт на проверку, и после неё деньги появятся на
              балансе.
            </p>
            <UsdtQuote kopecks={transaction.amountKopecks} fixedRate={detail.transfer?.usdtRate} />
            <ProofUploader proofs={proofs} onChange={setProofs} disabled={busy} />
            <Field label="Номер транзакции">
              <input
                type="text"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className={ui.input}
                maxLength={255}
                autoComplete="off"
                spellCheck={false}
                disabled={busy}
              />
              <span className={ui.hint}>Необязательно, но с ним перевод найдут быстрее.</span>
            </Field>
            <div className={styles.buttons}>
              <button
                type="button"
                className={ui.btnSecondary}
                disabled={busy}
                onClick={() =>
                  act(apiClient.api.cancelTopUp, `Отменить заявку на ${amount}?`, 'Заявка отменена')
                }
              >
                Отменить заявку
              </button>
              <button type="button" className={ui.btnPrimary} disabled={busy} onClick={markPaid}>
                {busy ? 'Отправляем…' : 'Я оплатил'}
              </button>
            </div>
          </div>
        )}
        {config.customerActions && isTopUp && isExpired && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              Время на оплату вышло — заявка просрочена. Если вы уже перевели деньги, напишите
              менеджеру финансов. Иначе создайте новую заявку: курс и сумма к переводу пересчитаются.
            </p>
            <Link to="/app/wallet" className={ui.btnPrimary}>
              Новая заявка
            </Link>
          </div>
        )}
        {config.customerActions && isWithdrawal && isExpired && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              Время на подтверждение вышло — вывод просрочен. Если деньги не пришли на кошелёк,
              напишите менеджеру финансов: он проверит перевод и при необходимости вернёт сумму на
              баланс.
            </p>
          </div>
        )}
        {config.customerActions && isTopUp && transaction.status === 'SENT' && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              Заявка на проверке: финансист сверит поступление и зачислит {amount} на баланс.
            </p>
          </div>
        )}
        {config.customerActions && isWithdrawal && transaction.status === 'SENT' && !timeIsUp && (
          <div className={styles.actions}>
            {timer('Подтвердите получение за')}
            <p className={styles.actionText}>
              Финансист отправил {amount} в USDT на ваш кошелёк TRON. Проверьте поступление и
              подтвердите получение.
            </p>
            <button
              type="button"
              className={ui.btnPrimary}
              disabled={busy}
              onClick={() =>
                act(
                  apiClient.api.confirmWalletOperation,
                  `Подтверждаете вывод на ${amount}?`,
                  'Операция подтверждена'
                )
              }
            >
              {busy ? 'Подтверждаем…' : 'Подтвердить'}
            </button>
          </div>
        )}
        {config.financeActions && isTopUp && isOpen && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              {transaction.status === 'SENT'
                ? 'Рекламодатель отметил оплату. Сверьте поступление на адрес платформы: пришли деньги — зачислите, нет — отклоните с причиной.'
                : 'Рекламодатель ещё не отметил оплату. Если перевод уже пришёл на адрес платформы, можно зачислить сразу.'}
            </p>
            <UsdtQuote
              kopecks={transaction.amountKopecks}
              fixedRate={detail.transfer?.usdtRate}
              label="Ожидаем на адресе платформы"
            />
            <div className={styles.buttons}>
              <button type="button" className={ui.btnDanger} onClick={reject} disabled={busy}>
                Отклонить
              </button>
              <button
                type="button"
                className={ui.btnPrimary}
                disabled={busy}
                onClick={() =>
                  act(
                    apiClient.api.confirmTopUp,
                    `Подтверждаете, что ${amount} пришли на адрес платформы? Сумма зачислится на баланс рекламодателя.`,
                    'Поступление подтверждено, баланс пополнен'
                  )
                }
              >
                {busy ? 'Зачисляем…' : 'Подтвердить поступление'}
              </button>
            </div>
          </div>
        )}
        {config.financeActions && isTopUp && transaction.status === 'EXPIRED' && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              Рекламодатель не оплатил заявку за час, она просрочена. Если перевод всё же пришёл на
              адрес платформы — его можно зачислить.
            </p>
            <UsdtQuote
              kopecks={transaction.amountKopecks}
              fixedRate={detail.transfer?.usdtRate}
              label="Ожидали на адресе платформы"
            />
            <button
              type="button"
              className={ui.btnPrimary}
              disabled={busy}
              onClick={() =>
                act(
                  apiClient.api.confirmTopUp,
                  `Подтверждаете, что ${amount} пришли на адрес платформы? Сумма зачислится на баланс рекламодателя.`,
                  'Поступление подтверждено, баланс пополнен'
                )
              }
            >
              {busy ? 'Зачисляем…' : 'Зачислить всё равно'}
            </button>
          </div>
        )}
        {config.financeActions && isWithdrawal && isExpired && (
          <div className={styles.actions}>
            <p className={styles.actionText}>
              Рекламодатель не подтвердил получение за час, вывод просрочен. Деньги остаются
              списанными. Если перевод не дошёл — отклоните, сумма вернётся на баланс.
            </p>
            <button type="button" className={ui.btnDanger} onClick={reject} disabled={busy}>
              {busy ? 'Отклоняем…' : 'Отклонить'}
            </button>
          </div>
        )}
        {config.financeActions && isWithdrawal && transaction.status === 'SENT' && !timeIsUp && (
          <div className={styles.actions}>
            {timer('Рекламодатель подтверждает получение, осталось')}
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
            <Link to={`/app/finance/payouts/${transaction.publicId}`} className={ui.btnPrimary}>
              Открыть заявку →
            </Link>
          </div>
        )}
      </TransferCard>
    </div>
  );
};

export default OperationPage;

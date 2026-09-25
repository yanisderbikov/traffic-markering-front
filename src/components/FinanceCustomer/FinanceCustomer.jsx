import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import Icon from '../shared/Icon/Icon';
import WalletSummary from '../shared/WalletSummary/WalletSummary';
import OperationRows from '../shared/OperationRows/OperationRows';
import ProofUploader from '../shared/ProofUploader/ProofUploader';
import { financeOperationLink } from '../../shared/routes';
import { errorMessage } from '../../shared/auth';
import { formatRubInput, formatRubles, rubToKopecks } from '../../shared/money';
import { formatDate } from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';
import styles from './FinanceCustomer.module.css';

const TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

const OPERATIONS = {
  TOP_UP: {
    label: 'Пополнить',
    verb: 'Пополнение',
    hint: 'Рекламодатель уже перевёл USDT платформе. Сумма сразу станет доступной, а операция будет ждать его подтверждения в кошельке.',
    request: (userId, body) => apiClient.api.topUpWallet(userId, body),
    done: (amount) => `Кошелёк пополнен на ${amount} — ждём подтверждения рекламодателя`,
  },
  WITHDRAWAL: {
    label: 'Вывести',
    verb: 'Вывод',
    hint: 'USDT уже отправлены рекламодателю. Списать можно только из свободного остатка: деньги в кампаниях не трогаются.',
    request: (userId, body) => apiClient.api.withdrawFromWallet(userId, body),
    done: (amount) => `С кошелька выведено ${amount} — ждём подтверждения рекламодателя`,
  },
};

const FinanceCustomer = () => {
  const { userId } = useParams();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [transactionsError, setTransactionsError] = useState('');
  const [operation, setOperation] = useState('TOP_UP');
  const [amountRub, setAmountRub] = useState('');
  const [txId, setTxId] = useState('');
  const [tronAddress, setTronAddress] = useState('');
  const [proofs, setProofs] = useState([]);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const res = await apiClient.api.financeCustomer(Number(userId));
      setWallet(res.data);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить кошелёк'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await apiClient.api.financeOperations({ userId: Number(userId) });
      setTransactions(Array.isArray(res.data) ? res.data : []);
      setTransactionsError('');
    } catch (err) {
      setTransactionsError(errorMessage(err, 'Не удалось загрузить операции'));
    } finally {
      setTransactionsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    setTransactionsLoading(true);
    loadWallet();
    loadTransactions();
  }, [loadWallet, loadTransactions]);

  const selectOperation = (next) => {
    setOperation(next);
    setErrors({});
    setError('');
  };

  const clearError = (name) => {
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountKopecks = rubToKopecks(amountRub);
    const current = OPERATIONS[operation];
    const address = tronAddress.trim();
    const nextErrors = {
      amountRub:
        amountKopecks == null || amountKopecks <= 0
          ? 'Сумма в рублях, больше нуля'
          : operation === 'WITHDRAWAL' && amountKopecks > (wallet?.balanceKopecks ?? 0)
            ? `Свободно только ${formatRubles(wallet?.balanceKopecks ?? 0)}`
            : '',
      txId: txId.trim() ? '' : 'Укажите номер транзакции',
      tronAddress:
        operation === 'WITHDRAWAL' && !TRON_RE.test(address)
          ? 'Адрес TRON (TRC-20) начинается с T и состоит из 34 символов'
          : '',
      proofs: proofs.length ? '' : 'Приложите хотя бы один скриншот перевода',
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const who = wallet?.customerName || wallet?.customerEmail || 'рекламодателя';
    if (
      !window.confirm(
        `${current.verb} ${formatRubles(amountKopecks)} для ${who}. Подтверждаете?`
      )
    ) {
      return;
    }

    setSaving(true);
    setError('');
    try {
      await current.request(Number(userId), {
        amountKopecks,
        txId: txId.trim(),
        proofKeys: proofs.map((proof) => proof.key),
        tronAddress: operation === 'WITHDRAWAL' ? address : undefined,
        comment: comment.trim() || undefined,
      });
      setAmountRub('');
      setTxId('');
      setTronAddress('');
      setProofs([]);
      setComment('');
      toast.success(current.done(formatRubles(amountKopecks)));
      await Promise.all([loadWallet(), loadTransactions()]);
    } catch (err) {
      setError(errorMessage(err, 'Не удалось провести операцию'));
    } finally {
      setSaving(false);
    }
  };

  const backLink = (
    <Link to="/app/finance" className={ui.backLink}>
      <Icon name="arrowLeft" size={16} />
      Ко всем рекламодателям
    </Link>
  );

  if (loading) {
    return (
      <div className={ui.page}>
        {backLink}
        <p className={ui.message}>Загрузка кошелька…</p>
      </div>
    );
  }

  if (pageError && !wallet) {
    return (
      <div className={ui.page}>
        {backLink}
        <p className={ui.errorBanner}>{pageError}</p>
      </div>
    );
  }

  const current = OPERATIONS[operation];

  return (
    <div className={ui.page}>
      {backLink}
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Кошелёк рекламодателя</span>
          <h1 className={ui.title}>{wallet.customerName || wallet.customerEmail}</h1>
          <p className={ui.subtitle}>
            {wallet.customerEmail}
            {wallet.customerCompany ? ` · ${wallet.customerCompany}` : ''}
            {wallet.updatedAt ? ` · кошелёк обновлён ${formatDate(wallet.updatedAt)}` : ''}
          </p>
        </div>
      </header>

      <WalletSummary wallet={wallet} />

      <form className={`${ui.card} ${styles.block}`} onSubmit={handleSubmit} noValidate>
        <div className={ui.chips} role="group" aria-label="Операция">
          {Object.entries(OPERATIONS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={operation === key ? ui.chipActive : ui.chip}
              onClick={() => selectOperation(key)}
              aria-pressed={operation === key}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className={styles.formGrid}>
          <Field label="Сумма, ₽ *">
            <input
              type="text"
              inputMode="decimal"
              value={amountRub}
              onChange={(e) => {
                setAmountRub(formatRubInput(e.target.value));
                clearError('amountRub');
              }}
              className={ui.input}
              aria-invalid={errors.amountRub ? 'true' : undefined}
              autoComplete="off"
              disabled={saving}
            />
            <FieldError>{errors.amountRub}</FieldError>
          </Field>
          <Field label="Номер транзакции *">
            <input
              type="text"
              value={txId}
              onChange={(e) => {
                setTxId(e.target.value);
                clearError('txId');
              }}
              className={ui.input}
              aria-invalid={errors.txId ? 'true' : undefined}
              maxLength={255}
              autoComplete="off"
              spellCheck={false}
              disabled={saving}
            />
            <FieldError>{errors.txId}</FieldError>
          </Field>
          {operation === 'WITHDRAWAL' && (
            <Field label="Адрес TRON рекламодателя (USDT TRC-20) *" className={styles.wide}>
              <input
                type="text"
                value={tronAddress}
                onChange={(e) => {
                  setTronAddress(e.target.value);
                  clearError('tronAddress');
                }}
                className={ui.input}
                aria-invalid={errors.tronAddress ? 'true' : undefined}
                autoComplete="off"
                spellCheck={false}
                disabled={saving}
              />
              <FieldError>{errors.tronAddress}</FieldError>
            </Field>
          )}
          <div className={styles.wide}>
            <ProofUploader
              proofs={proofs}
              onChange={(next) => {
                setProofs(next);
                clearError('proofs');
              }}
              disabled={saving}
            />
            <FieldError>{errors.proofs}</FieldError>
          </div>
          <Field label="Основание" className={styles.wide}>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={ui.input}
              maxLength={500}
              autoComplete="off"
              disabled={saving}
            />
            <span className={ui.hint}>{current.hint}</span>
          </Field>
        </div>

        {error && <p className={`${ui.errorText} ${styles.formError}`}>{error}</p>}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={operation === 'WITHDRAWAL' ? ui.btnDanger : ui.btnPrimary}
            disabled={saving}
          >
            {saving ? 'Проводим…' : current.label}
          </button>
        </div>
      </form>

      <section className={`${ui.card} ${styles.block}`}>
        <h2 className={ui.cardTitle}>Операции</h2>
        <OperationRows
          rows={transactions}
          loading={transactionsLoading}
          error={transactionsError}
          linkFor={financeOperationLink}
          emptyText="Операций по кошельку пока не было."
        />
      </section>
    </div>
  );
};

export default FinanceCustomer;

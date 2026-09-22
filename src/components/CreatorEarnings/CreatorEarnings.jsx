import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import OperationRows from '../shared/OperationRows/OperationRows';
import { errorMessage } from '../../shared/auth';
import { formatRubInput, formatRubles, kopecksToRub, rubToKopecks } from '../../shared/money';
import styles from './CreatorEarnings.module.css';

const TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

const CreatorEarnings = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [rowsError, setRowsError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [amountRub, setAmountRub] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      const res = await apiClient.api.myEarnings();
      setWallet(res.data);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить заработок'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRows = useCallback(async () => {
    try {
      const res = await apiClient.api.myOperations();
      setRows(Array.isArray(res.data) ? res.data : []);
      setRowsError('');
    } catch (err) {
      setRowsError(errorMessage(err, 'Не удалось загрузить операции'));
    } finally {
      setRowsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
    loadRows();
  }, [loadWallet, loadRows]);

  const openForm = () => {
    setAmountRub(formatRubInput(String(kopecksToRub(wallet?.balanceKopecks ?? 0))));
    setErrors({});
    setError('');
    setFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountKopecks = rubToKopecks(amountRub);
    const tronAddress = address.trim();
    const max = wallet?.balanceKopecks ?? 0;
    const nextErrors = {
      amountRub:
        amountKopecks == null || amountKopecks <= 0
          ? 'Сумма в рублях, больше нуля'
          : amountKopecks > max
            ? `Доступно только ${formatRubles(max)}`
            : '',
      address: TRON_RE.test(tronAddress)
        ? ''
        : 'Адрес TRON (TRC-20) начинается с T и состоит из 34 символов',
    };
    setErrors(nextErrors);
    if (nextErrors.amountRub || nextErrors.address) return;

    setSaving(true);
    setError('');
    try {
      const res = await apiClient.api.requestPayout({ amountKopecks, tronAddress });
      toast.success(`Заявка на ${formatRubles(amountKopecks)} отправлена финансисту`);
      navigate(`/app/earnings/${res.data.transaction.id}`);
    } catch (err) {
      setError(errorMessage(err, 'Не удалось создать заявку'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.wrap}>
        <p className={styles.message}>Загрузка заработка…</p>
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

  const balance = wallet?.balanceKopecks ?? 0;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Заработок</h1>
      <p className={styles.subtitle}>
        Начисления за просмотры попадают в кошелёк раз в сутки ночью — как только заработанное
        по объявлению дойдёт до его порога вывода. Вывод — в USDT на кошелёк TRON (TRC-20).
      </p>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>доступно к выводу</span>
          <span className={`${styles.summaryValue} ${styles.summaryFree}`}>
            {formatRubles(balance)}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>в заявках</span>
          <span className={styles.summaryValue}>{formatRubles(wallet?.reservedKopecks ?? 0)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>выведено</span>
          <span className={styles.summaryValue}>{formatRubles(wallet?.paidOutKopecks ?? 0)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>зачислено всего</span>
          <span className={styles.summaryValue}>{formatRubles(wallet?.earnedKopecks ?? 0)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>ждёт зачисления</span>
          <span className={styles.summaryValue}>{formatRubles(wallet?.pendingKopecks ?? 0)}</span>
        </div>
      </div>
      <p className={styles.text}>
        Начисленное уезжает в кошелёк ночью, когда сумма по объявлению дошла до его порога вывода,
        и только за просмотры старше семи дней: за это время площадка списывает ботов, а
        платформа проверяет ролик.
      </p>

      <section className={styles.card}>
        {!formOpen ? (
          <div className={styles.payoutRow}>
            <div>
              <h2 className={styles.cardTitle}>Вывод средств</h2>
              <p className={styles.text}>
                {wallet?.payoutAvailable
                  ? `Можно вывести до ${formatRubles(balance)}.`
                  : 'Пока нечего выводить: деньги появятся здесь, когда заработанное по объявлению дойдёт до его порога вывода.'}
              </p>
            </div>
            {wallet?.payoutAvailable && (
              <button type="button" className={styles.primaryBtn} onClick={openForm}>
                Вывести
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h2 className={styles.cardTitle}>Заявка на вывод</h2>
            <div className={styles.formGrid}>
              <Field label="Сумма, ₽ *">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountRub}
                  onChange={(e) => {
                    setAmountRub(formatRubInput(e.target.value));
                    setErrors((prev) => ({ ...prev, amountRub: '' }));
                    setError('');
                  }}
                  className={styles.input}
                  aria-invalid={errors.amountRub ? 'true' : undefined}
                  autoComplete="off"
                  disabled={saving}
                />
                <FieldError>{errors.amountRub}</FieldError>
                <span className={styles.hint}>До {formatRubles(balance)}.</span>
              </Field>
              <Field label="Адрес кошелька TRON (USDT TRC-20) *" className={styles.labelWide}>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrors((prev) => ({ ...prev, address: '' }));
                    setError('');
                  }}
                  className={styles.input}
                  aria-invalid={errors.address ? 'true' : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={saving}
                />
                <FieldError>{errors.address}</FieldError>
                <span className={styles.hint}>
                  Проверьте адрес дважды: перевод в сети TRON отменить нельзя.
                </span>
              </Field>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn} disabled={saving}>
                {saving ? 'Отправляем…' : 'Отправить заявку'}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Операции</h2>
        <OperationRows
          rows={rows}
          loading={rowsLoading}
          error={rowsError}
          linkFor={(row) => `/app/earnings/${row.id}`}
          emptyText="Начислений пока нет: они появятся после одобрения отклика и первых просмотров."
        />
      </section>
    </div>
  );
};

export default CreatorEarnings;

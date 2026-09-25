import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import OperationRows from '../shared/OperationRows/OperationRows';
import { errorMessage } from '../../shared/auth';
import { formatRubInput, formatRubles, kopecksToRub, rubToKopecks } from '../../shared/money';
import { pluralize } from '../../shared/requirements';
import ui from '../../shared/ui.module.css';
import styles from './CreatorEarnings.module.css';

const TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'earnings', label: 'Начисления', match: (row) => row.type === 'EARNING' },
  { value: 'payouts', label: 'Выводы', match: (row) => row.type === 'PAYOUT' },
];

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
  const [filter, setFilter] = useState('all');

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
      <div className={ui.page}>
        <p className={ui.message}>Загрузка финансов…</p>
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

  const balance = wallet?.balanceKopecks ?? 0;
  const canPayout = Boolean(wallet?.payoutAvailable);
  const activeFilter = FILTERS.find((item) => item.value === filter) || FILTERS[0];
  const visibleRows = activeFilter.match ? rows.filter(activeFilter.match) : rows;
  const confirmedPayouts = rows.filter(
    (row) => row.type === 'PAYOUT' && row.status === 'CONFIRMED'
  ).length;

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Креатор</span>
          <h1 className={ui.title}>Финансы</h1>
          <p className={ui.subtitle}>Начисления, выводы и история операций в одном месте.</p>
        </div>
        <div className={ui.pageHeadActions}>
          <button
            type="button"
            className={ui.btnPrimary}
            onClick={openForm}
            disabled={!canPayout || formOpen}
          >
            Вывести средства
          </button>
        </div>
      </header>

      <div className={styles.top}>
        <section className={styles.balance}>
          <span className={styles.balanceLabel}>Доступно к выводу</span>
          <span className={styles.balanceValue}>{formatRubles(balance)}</span>
          <div className={styles.balanceRow}>
            <span className={styles.balanceNote}>
              {canPayout
                ? 'Вывод в USDT на кошелёк TRON (TRC-20)'
                : 'Пока нечего выводить: деньги появятся, когда заработанное по офферу дойдёт до его порога'}
            </span>
            {canPayout && (
              <button type="button" className={ui.btnOnAccent} onClick={openForm} disabled={formOpen}>
                Вывести
              </button>
            )}
          </div>
        </section>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Ожидает подтверждения</span>
          <span className={ui.statValue}>{formatRubles(wallet?.pendingKopecks ?? 0)}</span>
          <span className={ui.statNote}>просмотры моложе 7 дней и ниже порога вывода</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Выплачено за всё время</span>
          <span className={ui.statValue}>{formatRubles(wallet?.paidOutKopecks ?? 0)}</span>
          <span className={`${ui.statNote} ${confirmedPayouts ? ui.statUp : ''}`}>
            {confirmedPayouts
              ? `${confirmedPayouts} ${pluralize(confirmedPayouts, ['успешная выплата', 'успешные выплаты', 'успешных выплат'])}`
              : `в заявках ${formatRubles(wallet?.reservedKopecks ?? 0)}`}
          </span>
        </div>
      </div>

      {formOpen && (
        <section className={`${ui.card} ${styles.payoutForm}`}>
          <form onSubmit={handleSubmit} noValidate>
            <h2 className={ui.cardTitle}>Заявка на вывод</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={ui.label} htmlFor="payout-amount">
                  Сумма, ₽
                </label>
                <input
                  id="payout-amount"
                  type="text"
                  inputMode="decimal"
                  value={amountRub}
                  onChange={(e) => {
                    setAmountRub(formatRubInput(e.target.value));
                    setErrors((prev) => ({ ...prev, amountRub: '' }));
                    setError('');
                  }}
                  className={ui.input}
                  aria-invalid={errors.amountRub ? 'true' : undefined}
                  autoComplete="off"
                  disabled={saving}
                />
                <FieldError>{errors.amountRub}</FieldError>
                <span className={ui.hint}>До {formatRubles(balance)}.</span>
              </div>
              <div className={`${styles.field} ${styles.fieldWide}`}>
                <label className={ui.label} htmlFor="payout-address">
                  Адрес кошелька TRON (USDT TRC-20)
                </label>
                <input
                  id="payout-address"
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrors((prev) => ({ ...prev, address: '' }));
                    setError('');
                  }}
                  className={ui.input}
                  aria-invalid={errors.address ? 'true' : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="T…"
                  disabled={saving}
                />
                <FieldError>{errors.address}</FieldError>
                <span className={ui.hint}>
                  Проверьте адрес дважды: перевод в сети TRON отменить нельзя.
                </span>
              </div>
            </div>
            {error && <p className={ui.errorText}>{error}</p>}
            <div className={styles.formActions}>
              <button type="submit" className={ui.btnPrimary} disabled={saving}>
                {saving ? 'Отправляем…' : 'Отправить заявку'}
              </button>
              <button
                type="button"
                className={ui.btnSecondary}
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Отмена
              </button>
            </div>
          </form>
        </section>
      )}

      <div className={ui.sectionHead}>
        <h2 className={ui.sectionTitle}>История операций</h2>
      </div>
      <div className={styles.filters}>
        <div className={ui.chips} role="group" aria-label="Тип операции">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={filter === item.value ? ui.chipActive : ui.chip}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <section className={ui.card}>
        <OperationRows
          rows={visibleRows}
          loading={rowsLoading}
          error={rowsError}
          linkFor={(row) => `/app/earnings/${row.id}`}
          emptyText={
            filter === 'all'
              ? 'Начислений пока нет: они появятся после одобрения работы и первых просмотров.'
              : 'Операций такого типа пока нет.'
          }
        />
      </section>

      <div className={styles.bottom}>
        <section className={ui.cardSuccess}>
          <p className={styles.infoTitle}>Как начисляются деньги</p>
          <p>
            Начисления за просмотры попадают в кошелёк раз в сутки ночью, как только заработанное по
            офферу дойдёт до его порога вывода. Считаются только просмотры старше семи дней: за это
            время площадка списывает ботов, а платформа проверяет ролик.
          </p>
        </section>
        <section className={ui.card}>
          <p className={styles.infoTitle}>Вывод средств</p>
          <p className={styles.infoText}>
            Вывод в USDT на кошелёк TRON (TRC-20). Заявку проводит менеджер финансов, после перевода
            вы подтверждаете получение в истории операций.
          </p>
        </section>
      </div>
    </div>
  );
};

export default CreatorEarnings;

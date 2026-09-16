import React, { useCallback, useEffect, useMemo, useState } from 'react';
import walletApi from '../../shared/walletApi';
import { ROLE_LABELS } from '../../shared/dictionaries';
import { formatRubInput, formatRubles, rubToKopecks } from '../../shared/money';
import WalletHistory from '../shared/WalletHistory/WalletHistory';
import styles from './AdminWallets.module.css';

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

const AdminWallets = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [direction, setDirection] = useState('credit');
  const [amountInput, setAmountInput] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadWallets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await walletApi.getAdminWallets();
      setWallets(Array.isArray(data) ? data : []);
      setPageError('');
    } catch (err) {
      setPageError(getErrorMessage(err, 'Не удалось загрузить кошельки'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async (userId) => {
    setTransactionsLoading(true);
    try {
      const data = await walletApi.getAdminTransactions(userId);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setTransactions([]);
      setFormError(getErrorMessage(err, 'Не удалось загрузить историю кошелька'));
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const visibleWallets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return wallets.filter((wallet) => {
      if (roleFilter !== 'ALL' && wallet.role !== roleFilter) return false;
      if (!normalizedQuery) return true;
      return [wallet.name, wallet.username]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [wallets, query, roleFilter]);

  const selectWallet = (wallet) => {
    setSelected(wallet);
    setDirection(wallet.role === 'CREATOR' ? 'debit' : 'credit');
    setAmountInput('');
    setReason('');
    setFormError('');
    setSuccessMessage('');
    setTransactions([]);
    loadTransactions(wallet.userId);
  };

  const closeEditor = () => {
    setSelected(null);
    setTransactions([]);
    setFormError('');
    setSuccessMessage('');
  };

  const handleAmountChange = (event) => {
    setAmountInput(formatRubInput(event.target.value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selected || submitting) return;

    const absoluteKopecks = rubToKopecks(amountInput);
    const trimmedReason = reason.trim();
    if (absoluteKopecks == null || absoluteKopecks <= 0) {
      setFormError('Укажите сумму больше нуля.');
      return;
    }
    if (!trimmedReason) {
      setFormError('Укажите причину изменения баланса.');
      return;
    }
    if (direction === 'debit' && absoluteKopecks > Number(selected.balanceKopecks || 0)) {
      setFormError('Нельзя списать больше текущего баланса.');
      return;
    }

    const amountKopecks = direction === 'debit' ? -absoluteKopecks : absoluteKopecks;
    setSubmitting(true);
    setFormError('');
    setSuccessMessage('');
    try {
      const updated = await walletApi.adjust(selected.userId, {
        amountKopecks,
        reason: trimmedReason,
      });
      setWallets((current) =>
        current.map((wallet) => (wallet.userId === updated.userId ? updated : wallet))
      );
      setSelected(updated);
      setAmountInput('');
      setReason('');
      setSuccessMessage(
        amountKopecks > 0
          ? `Баланс пополнен на ${formatRubles(amountKopecks)}.`
          : `С баланса списано ${formatRubles(Math.abs(amountKopecks))}.`
      );
      await loadTransactions(updated.userId);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Не удалось изменить баланс'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>администрирование</p>
          <h1 className={styles.title}>Кошельки</h1>
          <p className={styles.subtitle}>
            Ручные пополнения и списания. Каждое изменение сохраняется в истории вместе с причиной.
          </p>
        </div>
        <button type="button" className={styles.secondaryBtn} onClick={loadWallets}>
          Обновить
        </button>
      </div>

      {pageError && <p className={styles.banner}>{pageError}</p>}

      <div className={styles.filters}>
        <label className={styles.searchField}>
          <span>Поиск</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Имя или e-mail"
          />
        </label>
        <label className={styles.filterField}>
          <span>Роль</span>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="ALL">Все</option>
            <option value="CUSTOMER">Заказчики</option>
            <option value="CREATOR">Криаторы</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className={styles.message}>Загрузка кошельков…</p>
      ) : visibleWallets.length === 0 ? (
        <p className={styles.message}>По этому фильтру кошельков нет.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Баланс</th>
                <th aria-label="Действие" />
              </tr>
            </thead>
            <tbody>
              {visibleWallets.map((wallet) => (
                <tr key={wallet.userId}>
                  <td>
                    <strong className={styles.userName}>{wallet.name || wallet.username}</strong>
                    <span className={styles.userEmail}>{wallet.username}</span>
                  </td>
                  <td>
                    <span className={styles.roleBadge}>{ROLE_LABELS[wallet.role] || wallet.role}</span>
                  </td>
                  <td className={styles.balanceCell}>{formatRubles(wallet.balanceKopecks)}</td>
                  <td className={styles.actionCell}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => selectWallet(wallet)}
                    >
                      Изменить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <section className={styles.editor}>
          <div className={styles.editorHead}>
            <div>
              <p className={styles.eyebrow}>выбранный кошелёк</p>
              <h2 className={styles.editorTitle}>{selected.name || selected.username}</h2>
              <p className={styles.editorMeta}>
                {selected.username} · {ROLE_LABELS[selected.role] || selected.role}
              </p>
            </div>
            <button type="button" className={styles.closeBtn} onClick={closeEditor} aria-label="Закрыть">
              ×
            </button>
          </div>

          <div className={styles.editorGrid}>
            <div className={styles.currentBalance}>
              <span>Текущий баланс</span>
              <strong>{formatRubles(selected.balanceKopecks)}</strong>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>Операция</span>
                <select value={direction} onChange={(event) => setDirection(event.target.value)}>
                  <option value="credit">Пополнить</option>
                  <option value="debit">Списать</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Сумма, ₽</span>
                <input
                  value={amountInput}
                  onChange={handleAmountChange}
                  inputMode="decimal"
                  placeholder="10 000"
                  aria-invalid={Boolean(formError && !rubToKopecks(amountInput))}
                />
              </label>
              <label className={`${styles.field} ${styles.reasonField}`}>
                <span>Причина</span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Например: пополнение по счёту №…"
                />
              </label>

              {formError && <p className={styles.formError}>{formError}</p>}
              {successMessage && <p className={styles.formSuccess}>{successMessage}</p>}

              <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                {submitting ? 'Сохраняем…' : direction === 'credit' ? 'Пополнить баланс' : 'Списать с баланса'}
              </button>
            </form>
          </div>

          <div className={styles.history}>
            <h3 className={styles.historyTitle}>История изменений</h3>
            {transactionsLoading ? (
              <p className={styles.message}>Загрузка истории…</p>
            ) : (
              <WalletHistory
                transactions={transactions}
                emptyText="У этого кошелька ещё нет ручных операций."
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminWallets;

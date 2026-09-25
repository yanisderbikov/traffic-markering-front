import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import { errorMessage } from '../../shared/auth';
import { clearFieldError, hasErrors, validateEmail } from '../../shared/validation';
import { ASSIGNABLE_ROLES, ROLE_LABELS, formatDate } from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';
import styles from './AdminUsers.module.css';

const USERS_URL = '/api/superadmin/users';

const ROLE_CHIP = {
  CUSTOMER: ui.chipOutline,
  CREATOR: ui.chipSuccess,
  FINANCE_MANAGER: ui.chipActive,
  ADMIN: ui.chipWarning,
  SUPER_ADMIN: ui.chipDanger,
};

const emptyForm = { email: '', name: '', role: 'FINANCE_MANAGER' };

const matches = (user, query) =>
  [user.email, user.name].filter(Boolean).some((value) => value.toLowerCase().includes(query));

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const res = await apiClient.instance.get(USERS_URL);
      setUsers(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить пользователей'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(setErrors, name);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = { email: validateEmail(form.email) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    setError('');
    try {
      const res = await apiClient.instance.post(USERS_URL, {
        email: form.email.trim(),
        name: form.name.trim() || undefined,
        role: form.role,
      });
      toast.success(`${res.data.email}: ${ROLE_LABELS[res.data.role] || res.data.role}`);
      setForm(emptyForm);
      await loadUsers();
    } catch (err) {
      setError(errorMessage(err, 'Не удалось назначить роль'));
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (user, role) => {
    if (role === user.role) return;
    const label = ROLE_LABELS[role] || role;
    if (!window.confirm(`Сменить роль ${user.email} на «${label}»?`)) return;
    setBusyId(user.id);
    try {
      await apiClient.instance.post(USERS_URL, { email: user.email, role });
      toast.success(`${user.email}: ${label}`);
      await loadUsers();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось сменить роль'));
    } finally {
      setBusyId(null);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visible = useMemo(
    () => (normalizedQuery ? users.filter((user) => matches(user, normalizedQuery)) : users),
    [users, normalizedQuery]
  );

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Администрирование</span>
          <h1 className={ui.title}>Пользователи и роли</h1>
          <p className={ui.subtitle}>
            Учётка по почте заводится сразу, войти человек сможет кодом из письма. Супер-админ
            задаётся переменной окружения на бэке и здесь не меняется.
          </p>
        </div>
      </header>

      <form className={ui.card} onSubmit={handleSubmit} noValidate>
        <h2 className={ui.cardTitle}>Добавить почту и роль</h2>
        <div className={styles.formGrid}>
          <Field label="Почта *">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={setField}
              className={ui.input}
              aria-invalid={errors.email ? 'true' : undefined}
              autoComplete="off"
              disabled={saving}
            />
            <FieldError>{errors.email}</FieldError>
          </Field>
          <Field label="Имя">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={setField}
              className={ui.input}
              maxLength={255}
              autoComplete="off"
              disabled={saving}
            />
            <span className={ui.hint}>
              Пусто — возьмём часть почты до @, у существующей учётки имя не тронем.
            </span>
          </Field>
          <Field label="Роль *">
            <select
              name="role"
              value={form.role}
              onChange={setField}
              className={ui.input}
              disabled={saving}
            >
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role] || role}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error && <p className={`${ui.errorText} ${styles.formError}`}>{error}</p>}

        <div className={styles.formActions}>
          <button type="submit" className={ui.btnPrimary} disabled={saving}>
            {saving ? 'Сохраняем…' : 'Назначить роль'}
          </button>
        </div>
      </form>

      <section className={`${ui.card} ${styles.listCard}`}>
        <div className={styles.listHead}>
          <h2 className={ui.cardTitle}>Все пользователи</h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`${ui.input} ${styles.search}`}
            placeholder="Почта или имя"
            aria-label="Поиск по почте или имени"
          />
        </div>

        {pageError && <p className={ui.errorBanner}>{pageError}</p>}

        {loading ? (
          <p className={ui.message}>Загрузка пользователей…</p>
        ) : visible.length === 0 ? (
          <p className={ui.message}>
            {normalizedQuery ? 'Никого не нашлось по запросу.' : 'Пользователей пока нет.'}
          </p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Роль</th>
                  <th className={ui.right}>Сменить роль</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user) => {
                  const locked = user.role === 'SUPER_ADMIN';
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.who}>
                          <span className={styles.name}>{user.name}</span>
                          <span className={styles.email}>{user.email}</span>
                          <span className={styles.meta}>
                            {user.verifiedAt
                              ? `Почта подтверждена ${formatDate(user.verifiedAt)}`
                              : 'Ещё не входил'}
                            {user.createdAt ? ` · создан ${formatDate(user.createdAt)}` : ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={ROLE_CHIP[user.role] || ui.chip}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className={ui.right}>
                        {locked ? (
                          <span className={ui.faint}>Не меняется</span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => changeRole(user, e.target.value)}
                            className={`${ui.input} ${styles.roleSelect}`}
                            disabled={busyId === user.id}
                            aria-label={`Роль ${user.email}`}
                          >
                            {ASSIGNABLE_ROLES.map((role) => (
                              <option key={role} value={role}>
                                {ROLE_LABELS[role] || role}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminUsers;

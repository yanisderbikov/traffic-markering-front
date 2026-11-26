import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import Field from '../shared/Field/Field';
import { errorMessage } from '../../shared/auth';
import { formatDate } from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';
import styles from './AdminBroadcasts.module.css';

const REACH_URL = '/api/superadmin/notifications/reach';
const BROADCASTS_URL = '/api/superadmin/broadcasts';
const REFRESH_MS = 4000;

const AUDIENCES = [
  { value: 'ALL', label: 'Все — креаторы и рекламодатели', roles: ['CREATOR', 'CUSTOMER'] },
  { value: 'CREATOR', label: 'Только креаторы', roles: ['CREATOR'] },
  { value: 'CUSTOMER', label: 'Только рекламодатели', roles: ['CUSTOMER'] },
];

const CHANNELS = [
  { value: 'ANY', label: 'Telegram, а у кого его нет — почта', field: 'reachable' },
  { value: 'TELEGRAM', label: 'Только Telegram', field: 'telegram' },
  { value: 'EMAIL', label: 'Только почта', field: 'email' },
];

const STATUS = {
  QUEUED: { label: 'В очереди', chip: ui.chipOutline },
  SENDING: { label: 'Отправляется', chip: ui.chipWarning },
  DONE: { label: 'Готово', chip: ui.chipSuccess },
};

const emptyForm = {
  audience: 'ALL',
  channel: 'ANY',
  title: '',
  text: '',
  buttonText: '',
  buttonUrl: '/app',
};

const number = (value) => Number(value || 0).toLocaleString('ru-RU');

/** Рассылки в Telegram и на почту + сколько людей подключили бота */
const AdminBroadcasts = () => {
  const [reach, setReach] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      const [reachRes, listRes] = await Promise.all([
        apiClient.instance.get(REACH_URL),
        apiClient.instance.get(BROADCASTS_URL),
      ]);
      setReach(Array.isArray(reachRes.data) ? reachRes.data : []);
      setHistory(Array.isArray(listRes.data) ? listRes.data : []);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить рассылки'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Пока рассылка идёт — обновляем прогресс
  const running = history.some((b) => b.status !== 'DONE');
  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [running, load]);

  const byRole = useMemo(() => Object.fromEntries(reach.map((row) => [row.role, row])), [reach]);
  const creators = byRole.CREATOR || {};
  const customers = byRole.CUSTOMER || {};

  const audience = AUDIENCES.find((a) => a.value === form.audience);
  const channel = CHANNELS.find((c) => c.value === form.channel);
  const recipients = audience.roles.reduce((sum, role) => sum + Number(byRole[role]?.[channel.field] || 0), 0);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (test) => {
    if (!form.title.trim() || !form.text.trim()) {
      toast.error('Заполните заголовок и текст');
      return;
    }
    if (
      !test &&
      !window.confirm(`Отправить «${form.title.trim()}» — получателей примерно ${number(recipients)}?`)
    ) {
      return;
    }
    setBusy(test ? 'test' : 'send');
    try {
      await apiClient.instance.post(BROADCASTS_URL, {
        ...form,
        title: form.title.trim(),
        text: form.text.trim(),
        buttonText: form.buttonText.trim() || undefined,
        buttonUrl: form.buttonUrl.trim() || undefined,
        test,
      });
      if (test) {
        toast.success('Пробное сообщение отправлено вам — придёт в течение нескольких секунд');
      } else {
        toast.success('Рассылка поставлена в очередь');
        setForm(emptyForm);
        await load();
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось отправить'));
    } finally {
      setBusy('');
    }
  };

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Администрирование</span>
          <h1 className={ui.title}>Рассылки и уведомления</h1>
          <p className={ui.subtitle}>
            Бот сам пишет людям о событиях: креатору — что ролик одобрили или отклонили,
            рекламодателю — что пришёл новый ролик. У кого нет Telegram — письмо на почту.
            Здесь можно позвать всех вернуться на площадку.
          </p>
        </div>
      </header>

      {pageError && <p className={ui.errorBanner}>{pageError}</p>}

      <div className={ui.grid4}>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Креаторы</span>
          <span className={ui.statValue}>{loading ? '—' : number(creators.total)}</span>
          <span className={ui.statNote}>
            Telegram: {number(creators.telegram)} · почта: {number(creators.email)}
          </span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Рекламодатели</span>
          <span className={ui.statValue}>{loading ? '—' : number(customers.total)}</span>
          <span className={ui.statNote}>
            Telegram: {number(customers.telegram)} · почта: {number(customers.email)}
          </span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Подключили Telegram</span>
          <span className={ui.statValue}>
            {loading ? '—' : number(Number(creators.telegram || 0) + Number(customers.telegram || 0))}
          </span>
          <span className={`${ui.statNote} ${ui.statUp}`}>
            +{number(Number(creators.telegramWeek || 0) + Number(customers.telegramWeek || 0))} за 7 дней
          </span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Доступны для рассылки</span>
          <span className={ui.statValue}>
            {loading ? '—' : number(Number(creators.reachable || 0) + Number(customers.reachable || 0))}
          </span>
          <span className={ui.statNote}>Есть Telegram или почта</span>
        </div>
      </div>

      <form className={`${ui.card} ${styles.formCard}`} onSubmit={(e) => e.preventDefault()} noValidate>
        <h2 className={ui.cardTitle}>Новая рассылка</h2>
        <div className={styles.grid}>
          <Field label="Кому">
            <select name="audience" value={form.audience} onChange={setField} className={ui.input}>
              {AUDIENCES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Куда">
            <select name="channel" value={form.channel} onChange={setField} className={ui.input}>
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className={styles.stack}>
          <Field label="Заголовок (тема письма)">
            <input name="title" value={form.title} onChange={setField} className={ui.input} maxLength={200} />
          </Field>
          <Field label="Текст">
            <textarea
              name="text"
              value={form.text}
              onChange={setField}
              className={`${ui.input} ${ui.textarea} ${styles.text}`}
              maxLength={3500}
            />
          </Field>
          <div className={styles.grid}>
            <Field label="Текст кнопки">
              <input
                name="buttonText"
                value={form.buttonText}
                onChange={setField}
                className={ui.input}
                maxLength={64}
              />
            </Field>
            <Field label="Ссылка кнопки">
              <input name="buttonUrl" value={form.buttonUrl} onChange={setField} className={ui.input} maxLength={512} />
            </Field>
          </div>
          <span className={ui.hint}>
            Ссылка — путь на сайте (/app/board, /app/studio) или полный https-адрес. Наши страницы в Telegram
            открываются мини-приложением, вход уже выполнен. Пусто — «Открыть Offer» на кабинет.
          </span>
        </div>
        <div className={styles.actions}>
          <span className={ui.muted}>
            Получателей: <strong>{loading ? '…' : number(recipients)}</strong>
          </span>
          <div className={styles.buttons}>
            <button type="button" className={ui.btnSecondary} disabled={Boolean(busy)} onClick={() => submit(true)}>
              {busy === 'test' ? 'Отправляем…' : 'Отправить себе'}
            </button>
            <button
              type="button"
              className={ui.btnPrimary}
              disabled={Boolean(busy) || recipients === 0}
              onClick={() => submit(false)}
            >
              {busy === 'send' ? 'Ставим в очередь…' : 'Разослать'}
            </button>
          </div>
        </div>
      </form>

      <section className={`${ui.card} ${styles.formCard}`}>
        <h2 className={ui.cardTitle}>История</h2>
        {!loading && history.length === 0 ? (
          <p className={ui.message}>Рассылок пока не было.</p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Рассылка</th>
                  <th>Кому</th>
                  <th>Статус</th>
                  <th className={ui.right}>Доставлено</th>
                </tr>
              </thead>
              <tbody>
                {history.map((b) => {
                  const status = STATUS[b.status] || STATUS.QUEUED;
                  const done = b.sent + b.failed;
                  return (
                    <tr key={b.id}>
                      <td>
                        <div className={styles.who}>
                          <span className={ui.strong}>{b.title}</span>
                          <span className={ui.faint}>{formatDate(b.createdAt)}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.who}>
                          <span>{AUDIENCES.find((a) => a.value === b.audience)?.label || b.audience}</span>
                          <span className={ui.faint}>
                            {CHANNELS.find((c) => c.value === b.channel)?.label || b.channel}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`${ui.chip} ${status.chip}`}>{status.label}</span>
                      </td>
                      <td className={ui.right}>
                        <div className={styles.who}>
                          <span>
                            {number(b.sent)} из {number(b.total)}
                          </span>
                          {b.failed > 0 && <span className={ui.danger}>не дошло: {number(b.failed)}</span>}
                          {b.status === 'SENDING' && b.total > 0 && (
                            <span className={ui.faint}>{Math.round((done / b.total) * 100)}%</span>
                          )}
                        </div>
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

export default AdminBroadcasts;

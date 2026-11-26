import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { errorMessage } from '../../shared/auth';
import { formatDate } from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';

const MODERATORS_URL = '/api/superadmin/moderators';

const toText = (moderators) =>
  moderators
    .filter((moderator) => moderator.enabled)
    .map((moderator) => `@${moderator.username}`)
    .join('\n');

const statusOf = (moderator) => {
  if (!moderator.enabled) return { label: 'убран из списка', className: ui.chipOutline };
  if (!moderator.linked) return { label: 'ещё не заходил в бота', className: ui.chipWarning };
  if (moderator.paused) return { label: 'пауза', className: ui.chipWarning };
  if (moderator.available) return { label: 'принимает заявки', className: ui.chipSuccess };
  return { label: 'не его часы', className: ui.chipOutline };
};

/** Супер-админ: кто разбирает ролики в Telegram-боте модерации. Список — ники через @. */
const ModeratorRoster = () => {
  const [data, setData] = useState(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await apiClient.instance.get(MODERATORS_URL);
      setData(res.data);
      setText(toText(res.data.moderators || []));
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Не удалось загрузить менеджеров'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await apiClient.instance.put(MODERATORS_URL, { usernames: text.split('\n') });
      setData(res.data);
      setText(toText(res.data.moderators || []));
      toast.success('Список менеджеров сохранён');
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось сохранить список'));
    } finally {
      setSaving(false);
    }
  };

  const moderators = data?.moderators || [];

  return (
    <section className={ui.card}>
      <h2 className={ui.cardTitle}>Менеджеры в Telegram</h2>
      <p className={ui.muted}>
        Ролики на модерации раздаются менеджерам по одному в их рабочие часы. Не ответил за{' '}
        {data?.holdMinutes ?? 30} мин — заявка уходит следующему.{' '}
        {data?.botUsername ? (
          <>
            Менеджеры заходят в бота{' '}
            <a href={`https://t.me/${data.botUsername}`} target="_blank" rel="noreferrer">
              @{data.botUsername}
            </a>{' '}
            и сами выбирают часы.
          </>
        ) : data && !data.botEnabled ? (
          'Бот модерации не настроен: задайте MODERATION_TELEGRAM_BOT_TOKEN.'
        ) : null}
        {data ? ` В очереди ждут: ${data.waiting}.` : ''}
      </p>

      {error && <p className={ui.errorBanner}>{error}</p>}

      <label className={ui.label} htmlFor="moderator-usernames">
        Ники менеджеров, по одному в строке
      </label>
      <textarea
        id="moderator-usernames"
        className={ui.textarea}
        rows={5}
        placeholder={'@ivan_moder\n@maria_check'}
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={saving || !data}
      />
      <p className={ui.hint}>
        Кого уберёте из списка — тому заявки больше не придут, а его текущая вернётся в очередь.
      </p>
      <div>
        <button type="button" className={ui.btnPrimary} onClick={save} disabled={saving || !data}>
          {saving ? 'Сохраняю…' : 'Сохранить список'}
        </button>
      </div>

      {moderators.length > 0 && (
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Менеджер</th>
                <th>Статус</th>
                <th>Часы</th>
                <th>Сейчас</th>
                <th>За сутки</th>
                <th>Принято / отклонено / пропущено</th>
              </tr>
            </thead>
            <tbody>
              {moderators.map((moderator) => {
                const status = statusOf(moderator);
                return (
                  <tr key={moderator.username}>
                    <td>
                      @{moderator.username}
                      {moderator.displayName && <div className={ui.muted}>{moderator.displayName}</div>}
                    </td>
                    <td>
                      <span className={status.className}>{status.label}</span>
                    </td>
                    <td>{moderator.schedule}</td>
                    <td>
                      {moderator.activeApplication
                        ? `${moderator.activeApplication}${
                            moderator.activeUntil ? ` до ${formatDate(moderator.activeUntil)}` : ''
                          }`
                        : '—'}
                    </td>
                    <td>{moderator.decidedLastDay}</td>
                    <td>
                      {moderator.approved} / {moderator.rejected} / {moderator.missed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ModeratorRoster;

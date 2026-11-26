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

const DECISION_LABELS = { APPROVED: 'Принят', REJECTED: 'Отклонён' };

const statusOf = (moderator) => {
  if (!moderator.enabled) return { label: 'убран из списка', className: ui.chipOutline };
  if (!moderator.active) return { label: 'неактивен', className: ui.chipDanger };
  if (!moderator.linked) return { label: 'активен · ещё не заходил в бота', className: ui.chipWarning };
  if (moderator.available) return { label: 'активен · принимает заявки', className: ui.chipSuccess };
  return { label: 'активен · не его часы', className: ui.chipOutline };
};

/** Супер-админ: кто разбирает ролики в Telegram-боте модерации. Список — ники через @. */
const ModeratorRoster = () => {
  const [data, setData] = useState(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [decisionsFor, setDecisionsFor] = useState('');

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

  const loadDecisions = useCallback(async (username) => {
    try {
      const res = await apiClient.instance.get(`${MODERATORS_URL}/decisions`, {
        params: { limit: 100, username: username || undefined },
      });
      setDecisions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось загрузить журнал решений'));
    }
  }, []);

  useEffect(() => {
    loadDecisions(decisionsFor);
  }, [loadDecisions, decisionsFor]);

  const toggle = async (moderator) => {
    setToggling(moderator.username);
    try {
      const res = await apiClient.instance.patch(`${MODERATORS_URL}/${moderator.username}`, {
        active: !moderator.active,
      });
      setData(res.data);
      toast.success(`@${moderator.username}: ${moderator.active ? 'неактивен' : 'активен'}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось поменять статус'));
    } finally {
      setToggling(null);
    }
  };

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
        Ролики на модерации раздаются активным менеджерам по одному в их рабочие часы. Не ответил за{' '}
        {data?.holdMinutes ?? 30} мин — заявка уходит следующему; пропустил 3 подряд — становится неактивным.{' '}
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
        <div className={ui.tableWrap} style={{ marginTop: 20 }}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Менеджер</th>
                <th>Статус</th>
                <th>Часы</th>
                <th>Сейчас</th>
                <th>За сутки</th>
                <th>Принято / отклонено / пропущено</th>
                <th />
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
                    <td>
                      {moderator.enabled && (
                        <button
                          type="button"
                          className={`${moderator.active ? ui.btnSecondary : ui.btnPrimary} ${ui.btnSmall}`}
                          onClick={() => toggle(moderator)}
                          disabled={toggling === moderator.username}
                        >
                          {moderator.active ? 'Сделать неактивным' : 'Сделать активным'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h3 className={ui.sectionTitle} style={{ marginTop: 28 }}>
        Кто что решил
      </h3>
      <p className={ui.muted}>
        Последние решения в боте — для выборочной перепроверки. Если решение потом поменяли на сайте, текущий
        статус отличается от решения менеджера.
      </p>
      {moderators.length > 0 && (
        <select
          className={ui.input}
          value={decisionsFor}
          onChange={(event) => setDecisionsFor(event.target.value)}
          aria-label="Менеджер"
        >
          <option value="">Все менеджеры</option>
          {moderators.map((moderator) => (
            <option key={moderator.username} value={moderator.username}>
              @{moderator.username}
            </option>
          ))}
        </select>
      )}
      {decisions.length === 0 ? (
        <p className={ui.message}>Решений в боте пока нет.</p>
      ) : (
        <div className={ui.tableWrap} style={{ marginTop: 12 }}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Когда</th>
                <th>Менеджер</th>
                <th>Ролик</th>
                <th>Решение</th>
                <th>Сейчас</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((decision) => {
                const changed =
                  decision.applicationStatus &&
                  decision.applicationStatus !== decision.decision &&
                  !(decision.decision === 'APPROVED' && decision.applicationStatus === 'COMPLETED');
                return (
                  <tr key={decision.id}>
                    <td>{formatDate(decision.decidedAt)}</td>
                    <td>{decision.moderatorLabel}</td>
                    <td>
                      {decision.videoUrl ? (
                        <a href={decision.videoUrl} target="_blank" rel="noreferrer">
                          {decision.applicationPublicId}
                        </a>
                      ) : (
                        decision.applicationPublicId
                      )}
                      {decision.campaignTitle && <div className={ui.muted}>{decision.campaignTitle}</div>}
                    </td>
                    <td>
                      <span className={decision.decision === 'APPROVED' ? ui.chipSuccess : ui.chipDanger}>
                        {DECISION_LABELS[decision.decision] || decision.decision}
                      </span>
                      {decision.reason && <div className={ui.muted}>{decision.reason}</div>}
                    </td>
                    <td>
                      {decision.applicationStatus ? (
                        <span className={changed ? ui.chipWarning : ui.chipOutline}>
                          {changed ? 'изменено на сайте' : 'как решил'}
                        </span>
                      ) : (
                        'отклик удалён'
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
  );
};

export default ModeratorRoster;

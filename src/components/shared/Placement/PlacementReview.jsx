import React, { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../apiClient';
import RejectDialog from '../RejectDialog/RejectDialog';
import { errorMessage } from '../../../shared/auth';
import { formatDate } from '../../../shared/dictionaries';
import { formatDay } from '../../../shared/dates';
import { formatRubles, formatViews } from '../../../shared/money';
import { PLACEMENT_CHIP } from '../../../shared/placement';
import ui from '../../../shared/ui.module.css';
import styles from './Placement.module.css';

const DECIDABLE = ['PENDING', 'VERIFIED', 'REJECTED'];

export const PlacementSummary = ({ placement }) => (
  <div className={styles.summary}>
    {placement.billingViews != null ? (
      <span>
        Снимок при подаче: <b>{formatViews(placement.billingViews)}</b> просмотров
        {placement.billingCapturedAt ? ` · ${formatDate(placement.billingCapturedAt)}` : ''}
        {placement.billingSource ? ` · ${placement.billingSource}` : ''}
      </span>
    ) : (
      <span>Работа ещё не подана</span>
    )}
    <span>
      Ставка варианта: <b>{formatRubles(placement.selectedRatePerThousandKopecks)}</b> / 1 000
    </span>
    {placement.retainUntil && <span>Держать до {formatDay(placement.retainUntil)}</span>}
  </div>
);

export const PartFacts = ({ part }) => (
  <>
    {part.checkStateDescription && (
      <p className={styles.partMeta}>
        Автопроверка: {part.checkStateDescription.toLowerCase()}
        {part.checkDetail ? ` — ${part.checkDetail}` : ''}
        {part.checkedAt ? ` (${formatDate(part.checkedAt)})` : ''}
      </p>
    )}
    {(part.proofFileUrl || part.proofUrl) && (
      <p className={styles.partMeta}>
        {part.proofFileUrl && (
          <a href={part.proofFileUrl} target="_blank" rel="noreferrer" className={ui.linkAccent}>
            Открыть доказательство
          </a>
        )}
        {part.proofFileUrl && part.proofUrl ? ' · ' : ''}
        {part.proofUrl && (
          <a href={part.proofUrl} target="_blank" rel="noreferrer" className={ui.linkAccent}>
            Ссылка от креатора
          </a>
        )}
      </p>
    )}
    {part.note && <p className={styles.partMeta}>{part.note}</p>}
  </>
);

/**
 * Проверка надбавок «ссылка и промокод» для заказчика объявления и модератора: снимок при подаче,
 * доказательства, автопроверка ссылки и решение по каждой надбавке отдельно от ролика.
 */
const PlacementReview = ({ application, onChanged }) => {
  const placement = application.placement;
  const [busy, setBusy] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  if (!placement) return null;

  const live = application.status !== 'IN_PROGRESS' && application.status !== 'REJECTED';
  const parts = [placement.link, placement.promo].filter((part) => part && part.state !== 'NOT_SELECTED');

  const run = async (key, action, success) => {
    setBusy(key);
    try {
      await action();
      if (success) toast.success(success);
      setRejecting(null);
      await onChanged?.();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось сохранить решение'));
    } finally {
      setBusy(null);
    }
  };

  const decide = (part, decision, reason) =>
    run(
      part.kind,
      () => apiClient.api.decidePlacement(application.id, part.kind.toLowerCase(), { decision, reason }),
      decision === 'VERIFIED' ? `${part.kindDescription}: подтверждено` : `${part.kindDescription}: отказ`
    );

  const recheck = () =>
    run('check', () => apiClient.api.recheckPlacementLink(application.id), 'Профиль проверен ещё раз');

  return (
    <div className={styles.section}>
      <PlacementSummary placement={placement} />
      {parts.length === 0 ? (
        <p className={styles.partMeta}>Креатор участвует без надбавок: только рекламный ролик.</p>
      ) : (
        <ul className={styles.parts}>
          {parts.map((part) => (
            <li key={part.kind} className={styles.part}>
              <div className={styles.partHead}>
                <span>{part.kindDescription}</span>
                <span className={PLACEMENT_CHIP[part.state] || ui.chipOutline}>{part.stateDescription}</span>
              </div>
              <PartFacts part={part} />
              {live && DECIDABLE.includes(part.state) && (
                <div className={styles.partActions}>
                  {part.state !== 'VERIFIED' && (
                    <button
                      type="button"
                      className={`${ui.btnPrimary} ${ui.btnSmall}`}
                      onClick={() => decide(part, 'VERIFIED')}
                      disabled={busy !== null}
                    >
                      Подтвердить
                    </button>
                  )}
                  {part.state !== 'REJECTED' && (
                    <button
                      type="button"
                      className={`${ui.btnDanger} ${ui.btnSmall}`}
                      onClick={() => setRejecting(part)}
                      disabled={busy !== null}
                    >
                      Не подтверждать
                    </button>
                  )}
                  {part.kind === 'LINK' && (
                    <button
                      type="button"
                      className={`${ui.btnSecondary} ${ui.btnSmall}`}
                      onClick={recheck}
                      disabled={busy !== null}
                    >
                      {busy === 'check' ? 'Проверяем…' : 'Проверить профиль'}
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className={styles.note}>
        Отказ по надбавке не отклоняет ролик: база за рекламный ролик остаётся. Подтверждённая надбавка
        засчитывается после срока размещения.
      </p>
      <RejectDialog
        title="Не подтверждать надбавку"
        confirmLabel="Не подтверждать"
        subject={rejecting && `${rejecting.kindDescription} · ${application.creatorName}`}
        busy={rejecting != null && busy === rejecting.kind}
        onCancel={() => setRejecting(null)}
        onConfirm={(reason) => decide(rejecting, 'REJECTED', reason)}
      />
    </div>
  );
};

export default PlacementReview;

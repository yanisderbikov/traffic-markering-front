import React, { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../../apiClient';
import ProofPicker from './ProofPicker';
import PlacementMaterials from './PlacementMaterials';
import { PartFacts, PlacementSummary } from './PlacementReview';
import { errorMessage } from '../../../shared/auth';
import { PLACEMENT_CHIP } from '../../../shared/placement';
import ui from '../../../shared/ui.module.css';
import styles from './Placement.module.css';

const REVISABLE = ['PENDING', 'REJECTED'];

const FixForm = ({ application, part, onDone, onCancel }) => {
  const [proof, setProof] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [sending, setSending] = useState(false);
  const isLink = part.kind === 'LINK';

  const submit = async () => {
    setSending(true);
    try {
      await apiClient.api.resubmitPlacementProof(application.id, part.kind.toLowerCase(), {
        proofKey: proof?.key || null,
        proofUrl: proofUrl.trim() || null,
      });
      toast.success('Отправили на проверку');
      await onDone();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось отправить исправление'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.section}>
      <ProofPicker
        value={proof}
        onChange={setProof}
        disabled={sending}
        label={isLink ? 'Скриншот профиля со ссылкой' : 'Скриншот или запись экрана с закреплённым комментарием'}
        hint={
          isLink
            ? 'Если ссылка уже в профиле, можно без файла — проверим профиль автоматически.'
            : 'Должно быть видно ролик, ваш комментарий с промокодом и отметку «закреплено».'
        }
      />
      {!isLink && (
        <input
          type="url"
          className={ui.input}
          placeholder="Ссылка на комментарий, если есть"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          maxLength={1024}
          disabled={sending}
        />
      )}
      <div className={styles.partActions}>
        <button
          type="button"
          className={`${ui.btnPrimary} ${ui.btnSmall}`}
          onClick={submit}
          disabled={sending || (!isLink && !proof)}
        >
          {sending ? 'Отправляем…' : 'Отправить на проверку'}
        </button>
        <button type="button" className={`${ui.btnSecondary} ${ui.btnSmall}`} onClick={onCancel} disabled={sending}>
          Отмена
        </button>
      </div>
    </div>
  );
};

/**
 * Работа «ссылка и промокод» в кабинете креатора: материалы кампании, снимок при подаче и
 * судьба каждой надбавки — с исправлением, отказом от надбавки и повторной проверкой ссылки.
 */
const PlacementWork = ({ application, onChanged }) => {
  const placement = application.placement;
  const [fixing, setFixing] = useState(null);
  const [busy, setBusy] = useState(null);
  if (!placement) return null;

  const withLink = placement.link?.state && placement.link.state !== 'NOT_SELECTED';
  const withPromo = placement.promo?.state && placement.promo.state !== 'NOT_SELECTED';
  const submitted = Boolean(placement.submittedAt);
  const live = submitted && application.status !== 'REJECTED';
  const parts = [placement.link, placement.promo].filter((part) => part && part.state !== 'NOT_SELECTED');

  const decline = async (part) => {
    if (!window.confirm(`Продолжить без надбавки «${part.kindDescription}»? Ставка станет меньше.`)) return;
    setBusy(part.kind);
    try {
      await apiClient.api.declinePlacement(application.id, part.kind.toLowerCase());
      toast.success('Продолжаем без этой надбавки');
      await onChanged?.();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось отказаться от надбавки'));
    } finally {
      setBusy(null);
    }
  };

  const recheck = async () => {
    setBusy('check');
    try {
      await apiClient.api.recheckPlacementLink(application.id);
      toast.success('Профиль проверен');
      await onChanged?.();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось проверить профиль'));
    } finally {
      setBusy(null);
    }
  };

  if (!submitted) {
    return (
      <div className={styles.section}>
        <PlacementMaterials placement={placement} withLink={withLink} withPromo={withPromo} />
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <PlacementSummary placement={placement} />
      {parts.length > 0 && (
        <ul className={styles.parts}>
          {parts.map((part) => (
            <li key={part.kind} className={styles.part}>
              <div className={styles.partHead}>
                <span>{part.kindDescription}</span>
                <span className={PLACEMENT_CHIP[part.state] || ui.chipOutline}>{part.stateDescription}</span>
              </div>
              <PartFacts part={part} />
              {fixing === part.kind ? (
                <FixForm
                  application={application}
                  part={part}
                  onCancel={() => setFixing(null)}
                  onDone={async () => {
                    setFixing(null);
                    await onChanged?.();
                  }}
                />
              ) : (
                live &&
                REVISABLE.includes(part.state) && (
                  <div className={styles.partActions}>
                    <button
                      type="button"
                      className={`${ui.btnSecondary} ${ui.btnSmall}`}
                      onClick={() => setFixing(part.kind)}
                      disabled={busy !== null}
                    >
                      Исправить
                    </button>
                    {part.kind === 'LINK' && (
                      <button
                        type="button"
                        className={`${ui.btnSecondary} ${ui.btnSmall}`}
                        onClick={recheck}
                        disabled={busy !== null}
                      >
                        {busy === 'check' ? 'Проверяем…' : 'Проверить снова'}
                      </button>
                    )}
                    <button
                      type="button"
                      className={ui.linkMuted}
                      onClick={() => decline(part)}
                      disabled={busy !== null}
                    >
                      Продолжить без надбавки
                    </button>
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      )}
      {live && (withLink || withPromo) && (
        <PlacementMaterials placement={placement} withLink={withLink} withPromo={withPromo} />
      )}
    </div>
  );
};

export default PlacementWork;

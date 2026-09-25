import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../apiClient';
import Icon from '../shared/Icon/Icon';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import { formatDate } from '../../shared/dictionaries';
import { pluralize } from '../../shared/requirements';
import {
  CAMPAIGN_STEPS,
  firstIncompleteStep,
  formFromCampaign,
  isBlankDraft,
  isUnfinishedDraft,
  missingLabels,
} from './campaignForm';
import ui from '../../shared/ui.module.css';
import styles from './CampaignEditor.module.css';

let pendingDraft = null;

const startDraft = () => {
  if (!pendingDraft) {
    pendingDraft = apiClient.api.startCampaignDraft().finally(() => {
      pendingDraft = null;
    });
  }
  return pendingDraft;
};

const updatedTime = (campaign) => Date.parse(campaign.updatedAt || campaign.createdAt || '') || 0;

const unfinishedDrafts = (campaigns) =>
  campaigns.filter(isUnfinishedDraft).sort((a, b) => updatedTime(b) - updatedTime(a));

const ResumeChoice = ({ draft, othersCount, restarting, error, onContinue, onRestart }) => {
  const form = formFromCampaign(draft);
  const stepIndex = firstIncompleteStep(form);
  const missing = missingLabels(form);
  const reservedKopecks = draft.budgetKopecks ?? 0;

  return (
    <section className={`${ui.card} ${styles.resumeCard}`}>
      <span className={ui.eyebrow}>Незаконченный черновик</span>
      <div className={styles.resume}>
        {draft.photoUrl && (
          <div className={styles.photoPreview}>
            <img src={draft.photoUrl} alt="" />
          </div>
        )}
        <div className={styles.resumeBody}>
          <p className={styles.resumeTitle}>{draft.title || 'Без названия'}</p>
          <p className={styles.resumeMeta}>
            Шаг {stepIndex + 1} из {CAMPAIGN_STEPS.length} · {CAMPAIGN_STEPS[stepIndex].title}
            {draft.updatedAt ? ` · изменён ${formatDate(draft.updatedAt)}` : ''}
          </p>
          {missing.length ? (
            <p className={ui.hintWarn}>Осталось заполнить: {missing.join(', ')}</p>
          ) : (
            <p className={ui.hintOk}>Всё заполнено — осталось запустить</p>
          )}
        </div>
      </div>

      <div className={styles.resumeActions}>
        <button type="button" className={`${ui.btnPrimary} ${ui.btnLarge}`} onClick={onContinue} disabled={restarting}>
          Продолжить заполнение →
        </button>
        <button type="button" className={`${ui.btnDanger} ${ui.btnLarge}`} onClick={onRestart} disabled={restarting}>
          {restarting ? 'Удаляем…' : 'Удалить и начать заново'}
        </button>
      </div>
      <p className={ui.hint}>
        Начать заново — черновик удалится
        {othersCount > 0
          ? ` вместе с ещё ${othersCount} ${pluralize(othersCount, ['незаконченным черновиком', 'незаконченными черновиками', 'незаконченными черновиками'])}`
          : ''}
        {reservedKopecks > 0 ? `, зарезервированные ${formatRubles(reservedKopecks)} вернутся в кошелёк` : ''}.
        Одновременно можно заполнять только одну новую кампанию.
      </p>
      {error && <p className={`${ui.errorText} ${styles.formError}`}>{error}</p>}
    </section>
  );
};

const DraftStart = () => {
  const navigate = useNavigate();
  const [choice, setChoice] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [restarting, setRestarting] = useState(false);

  const openDraft = (draft) => navigate(`/app/campaigns/${draft.id}`, { replace: true });

  useEffect(() => {
    let active = true;
    const begin = async () => {
      const res = await apiClient.api.myCampaigns();
      const drafts = unfinishedDrafts(Array.isArray(res.data) ? res.data : []);
      const offered = drafts.find((draft) => !isBlankDraft(draft));
      if (offered) return { offered, othersCount: drafts.length - 1 };
      if (drafts.length === 1) return { open: drafts[0] };
      const created = await startDraft();
      return { open: created.data };
    };
    setError('');
    begin()
      .then((result) => {
        if (!active) return;
        if (result.open) navigate(`/app/campaigns/${result.open.id}`, { replace: true });
        else setChoice(result);
      })
      .catch((err) => {
        if (active) setError(errorMessage(err, 'Не удалось начать новую кампанию'));
      });
    return () => {
      active = false;
    };
  }, [attempt, navigate]);

  const restart = async () => {
    setRestarting(true);
    setError('');
    try {
      const res = await apiClient.api.startCampaignDraft({ restart: true });
      openDraft(res.data);
    } catch (err) {
      setError(errorMessage(err, 'Не удалось начать заново'));
      setRestarting(false);
    }
  };

  return (
    <div className={ui.page}>
      <Link to="/app/campaigns" className={ui.backLink}>
        <Icon name="arrowLeft" size={16} /> Мои кампании
      </Link>

      {choice ? (
        <>
          <header className={ui.pageHead}>
            <div className={ui.pageHeadMain}>
              <span className={ui.eyebrow}>Рекламодатель</span>
              <h1 className={ui.title}>Новая кампания</h1>
              <p className={ui.subtitle}>
                У вас есть незаконченная кампания. Дозаполните её или начните с нуля.
              </p>
            </div>
          </header>
          <ResumeChoice
            draft={choice.offered}
            othersCount={choice.othersCount}
            restarting={restarting}
            error={error}
            onContinue={() => openDraft(choice.offered)}
            onRestart={restart}
          />
        </>
      ) : error ? (
        <>
          <p className={ui.errorBanner}>{error}</p>
          <button type="button" className={ui.btnPrimary} onClick={() => setAttempt((n) => n + 1)}>
            Попробовать ещё раз
          </button>
        </>
      ) : (
        <p className={ui.message}>Готовим новую кампанию…</p>
      )}
    </div>
  );
};

export default DraftStart;

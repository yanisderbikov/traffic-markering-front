import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import PlacementRates, { variantKey } from '../shared/Placement/PlacementRates';
import PlacementMaterials from '../shared/Placement/PlacementMaterials';
import ProofPicker from '../shared/Placement/ProofPicker';
import { errorMessage } from '../../shared/auth';
import { formatDate, PLATFORM_LABELS } from '../../shared/dictionaries';
import { formatDay } from '../../shared/dates';
import { formatRubles, formatViews } from '../../shared/money';
import { campaignRates, rateVariants, workRates } from '../../shared/placement';
import { hasContentRates } from '../../shared/contentRates';
import ContentTopicPicker from '../shared/ContentTopicPicker/ContentTopicPicker';
import { detectPlatform } from '../../shared/video';
import ui from '../../shared/ui.module.css';
import placementStyles from '../shared/Placement/Placement.module.css';
import styles from './ApplyPage.module.css';

const Row = ({ label, value, muted = false }) => (
  <div className={ui.kv}>
    <span className={ui.kvKey}>{label}</span>
    <span className={muted ? ui.kvKey : ui.kvValue}>{value}</span>
  </div>
);

const QuoteView = ({ quote }) => (
  <div className={placementStyles.quote}>
    <Row
      label="Просмотры на момент расчёта"
      value={`${formatViews(quote.views ?? 0)} · ${formatDate(quote.capturedAt)}`}
    />
    {quote.payableViews !== quote.views && (
      <Row
        label="Из региона объявления"
        value={quote.geographyKnown ? formatViews(quote.payableViews ?? 0) : 'география неизвестна'}
      />
    )}
    <Row
      label="К оплате, округлено до сотен"
      value={`${formatViews(quote.billableViews ?? 0)}${quote.cappedForNewCreator ? ' (лимит новичка)' : ''}`}
    />
    <Row label="База за ролик" value={formatRubles(quote.baseKopecks ?? 0)} />
    {quote.withLink && <Row label="Надбавка за ссылку" value={`+ ${formatRubles(quote.linkKopecks ?? 0)}`} />}
    {quote.withPromo && (
      <Row label="Надбавка за промокод" value={`+ ${formatRubles(quote.promoKopecks ?? 0)}`} />
    )}
    {quote.limited && (
      <Row
        label="Ограничение"
        value={`потолок за ролик или остаток бюджета: ${formatRubles(quote.totalKopecks ?? 0)}`}
        muted
      />
    )}
    <Row
      label={`Комиссия платформы ${quote.commissionPercent ?? 10}% при выводе`}
      value={`− ${formatRubles(quote.commissionKopecks ?? 0)}`}
      muted
    />
    <div className={placementStyles.quoteTotal}>
      <span>После подтверждения и комиссии</span>
      <span>{formatRubles(quote.netKopecks ?? 0)}</span>
    </div>
    {(quote.withLink || quote.withPromo) && (
      <p className={placementStyles.note}>
        Без подтверждённых надбавок — {formatRubles(quote.baseOnlyKopecks ?? 0)} до комиссии. Надбавки
        засчитываются после срока размещения{quote.retainUntil ? `: держите до ${formatDay(quote.retainUntil)}` : ''}.
      </p>
    )}
    {quote.belowMinPaidViews && (
      <p className={ui.hintWarn}>
        Ролик пока не дотянул до порога оплаты ({formatViews(quote.minPaidViews ?? 0)} просмотров) — подайте
        его позже.
      </p>
    )}
    <p className={placementStyles.note}>
      Новые просмотры после подачи эту работу не увеличат. Расчёт действует до {formatDate(quote.expiresAt)} —
      потом рассчитайте заново.
    </p>
  </div>
);

/**
 * Подача работы «ссылка и промокод»: вариант участия → материалы → ролик → расчёт по свежему
 * снимку просмотров → доказательства → подача. Просмотры фиксируются в момент подачи.
 */
const SnapshotApply = ({ campaign, workInProgress, onWorkChange, inactive, accounts }) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(null);
  const [videoUrl, setVideoUrl] = useState(workInProgress?.videoUrl || '');
  const [videoError, setVideoError] = useState('');
  const [quote, setQuote] = useState(null);
  const [linkProof, setLinkProof] = useState(null);
  const [promoProof, setPromoProof] = useState(null);
  const [commentUrl, setCommentUrl] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [contentTopic, setContentTopic] = useState(workInProgress?.contentTopic || '');
  const [topicError, setTopicError] = useState('');

  const placement = workInProgress?.placement;
  const rates = placement ? workRates(placement) : campaignRates(campaign);
  const variants = rateVariants(rates);
  const withLink = placement ? placement.link?.state !== 'NOT_SELECTED' : false;
  const withPromo = placement ? placement.promo?.state !== 'NOT_SELECTED' : false;
  const [pendingVariant, setPendingVariant] = useState(variants[0]?.key);
  const selected = placement ? variantKey(withLink, withPromo) : pendingVariant;

  const platform = detectPlatform(videoUrl);
  const hasAccount =
    !platform ||
    accounts === null ||
    accounts.some((account) => account.platform === platform && account.status === 'ACTIVE');
  const needLinkProof = quote?.withLink && quote.linkCheckState !== 'FOUND';

  const take = async () => {
    const variant = variants.find((item) => item.key === pendingVariant) || variants[0];
    setBusy('take');
    setFormError('');
    try {
      const res = await apiClient.api.apply({
        campaignId: campaign.id,
        withLink: Boolean(variant?.withLink),
        withPromo: Boolean(variant?.withPromo),
      });
      onWorkChange(res.data);
      toast.success('Оффер в работе: материалы ниже');
    } catch (err) {
      setFormError(errorMessage(err, 'Не удалось взять оффер в работу'));
    } finally {
      setBusy(null);
    }
  };

  const choose = async (variant) => {
    if (!placement) {
      setPendingVariant(variant.key);
      return;
    }
    if (variant.key === selected) return;
    setBusy('variant');
    setFormError('');
    try {
      const res = await apiClient.api.choosePlacements(workInProgress.id, {
        withLink: variant.withLink,
        withPromo: variant.withPromo,
      });
      onWorkChange(res.data);
      setQuote(null);
    } catch (err) {
      setFormError(errorMessage(err, 'Не удалось сменить вариант'));
    } finally {
      setBusy(null);
    }
  };

  const calculate = async () => {
    const url = videoUrl.trim();
    if (!url) {
      setVideoError('Укажите ссылку на ролик');
      return;
    }
    if (!platform) {
      setVideoError('Площадка не распознана: принимаются YouTube, TikTok и Instagram');
      return;
    }
    if (hasContentRates(campaign) && !contentTopic) {
      setTopicError('Выберите тематику ролика — от неё зависит базовая ставка');
      return;
    }
    setBusy('quote');
    setFormError('');
    setQuote(null);
    try {
      const res = await apiClient.api.quoteWork(workInProgress.id, {
        videoUrl: url,
        contentTopic: contentTopic || null,
      });
      setQuote(res.data);
    } catch (err) {
      setFormError(errorMessage(err, 'Не удалось рассчитать работу'));
    } finally {
      setBusy(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!quote) return;
    if (needLinkProof && !linkProof) {
      setFormError('Ссылку в профиле автоматически не подтвердили — приложите скриншот профиля или выберите вариант без ссылки');
      return;
    }
    if (quote.withPromo && !promoProof) {
      setFormError('Приложите скриншот или запись экрана с закреплённым комментарием — или выберите вариант без промокода');
      return;
    }
    setBusy('submit');
    setFormError('');
    try {
      await apiClient.api.submitWork(workInProgress.id, {
        snapshotId: quote.snapshotId,
        withLink: quote.withLink,
        withPromo: quote.withPromo,
        linkProofKey: linkProof?.key || null,
        promoProofKey: promoProof?.key || null,
        promoCommentUrl: commentUrl.trim() || null,
        comment: comment.trim() || null,
      });
      toast.success('Работа подана — просмотры зафиксированы');
      navigate('/app/applications');
    } catch (err) {
      if (err?.response?.status === 409) setQuote(null);
      setFormError(errorMessage(err, 'Не удалось подать работу'));
    } finally {
      setBusy(null);
    }
  };

  const disabled = inactive || busy !== null;

  return (
    <form className={`${ui.card} ${styles.form}`} onSubmit={submit} noValidate>
      <section className={placementStyles.section}>
        <h2 className={placementStyles.sectionTitle}>1. Вариант участия</h2>
        <PlacementRates rates={rates} selected={selected} onSelect={choose} disabled={disabled} />
        <p className={placementStyles.note}>
          Ставки за 1 000 просмотров до комиссии платформы.{' '}
          {hasContentRates(campaign)
            ? 'Базовая ставка зависит от тематики ролика — указана наибольшая, тематику выберете при расчёте. '
            : ''}
          {placement
            ? 'Вариант можно менять, пока работа не подана.'
            : 'Нет возможности поставить ссылку или закрепить комментарий — выберите вариант без этого.'}
        </p>
        {!placement && (
          <div className={styles.actions}>
            <button type="button" className={ui.btnPrimary} onClick={take} disabled={disabled}>
              {busy === 'take' ? 'Берём в работу…' : 'Взять оффер и получить материалы'}
            </button>
          </div>
        )}
      </section>

      {placement && (
        <>
          {(withLink || withPromo) && (
            <>
              <div className={ui.divider} />
              <section className={placementStyles.section}>
                <h2 className={placementStyles.sectionTitle}>2. Разместите ссылку и промокод</h2>
                <PlacementMaterials placement={placement} withLink={withLink} withPromo={withPromo} />
              </section>
            </>
          )}

          <div className={ui.divider} />
          <section className={placementStyles.section}>
            <h2 className={placementStyles.sectionTitle}>
              {withLink || withPromo ? '3.' : '2.'} Ролик и расчёт
            </h2>
            <div className={styles.field}>
              <label htmlFor="snapshot-video-url" className={ui.label}>
                Ссылка на ролик *
              </label>
              <input
                id="snapshot-video-url"
                type="url"
                className={ui.input}
                placeholder="https://"
                value={videoUrl}
                maxLength={1024}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setVideoError('');
                  setQuote(null);
                }}
                aria-invalid={videoError ? 'true' : undefined}
                disabled={disabled}
              />
              <FieldError>{videoError}</FieldError>
              {platform && !hasAccount && (
                <span className={ui.hintWarn}>
                  {PLATFORM_LABELS[platform]} не привязан в профиле.{' '}
                  <Link to="/app/profile#socials" className={styles.inlineLink}>
                    Привязать аккаунт
                  </Link>
                </span>
              )}
              <span className={ui.hint}>
                Новый ролик, выложенный после взятия оффера, с подключённого аккаунта. Подавайте, когда он
                наберёт просмотры: по ним и считается оплата.
              </span>
            </div>
            <ContentTopicPicker
              campaign={campaign}
              value={contentTopic}
              onChange={(name) => {
                setContentTopic(name);
                setTopicError('');
                setQuote(null);
              }}
              disabled={disabled}
              error={topicError}
            />
            <div className={styles.actions}>
              <button
                type="button"
                className={quote ? ui.btnSecondary : ui.btnPrimary}
                onClick={calculate}
                disabled={disabled}
              >
                {busy === 'quote' ? 'Считаем просмотры…' : quote ? 'Рассчитать заново' : 'Рассчитать'}
              </button>
            </div>
            {quote && <QuoteView quote={quote} />}
          </section>

          {quote && (
            <>
              {quote.withLink && (
                <p className={quote.linkCheckState === 'FOUND' ? ui.hintOk : ui.hintWarn}>
                  Ссылка в профиле: {quote.linkCheckStateDescription?.toLowerCase() || 'не проверена'}
                  {quote.linkCheckDetail ? ` — ${quote.linkCheckDetail}` : ''}
                </p>
              )}
              {(needLinkProof || quote.withPromo) && (
                <>
                  <div className={ui.divider} />
                  <section className={placementStyles.section}>
                    <h2 className={placementStyles.sectionTitle}>Доказательства размещения</h2>
                    {needLinkProof && (
                      <ProofPicker
                        value={linkProof}
                        onChange={setLinkProof}
                        disabled={disabled}
                        label="Скриншот профиля со ссылкой *"
                        hint="Видно ваш аккаунт и рекламную ссылку в ссылках профиля. Проверит модератор."
                      />
                    )}
                    {quote.withPromo && (
                      <>
                        <ProofPicker
                          value={promoProof}
                          onChange={setPromoProof}
                          disabled={disabled}
                          label="Скриншот или запись экрана с закрепом *"
                          hint="Видно ролик, ваш комментарий с промокодом и отметку «закреплено». Запись экрана надёжнее."
                        />
                        <input
                          type="url"
                          className={ui.input}
                          placeholder="Ссылка на комментарий, если площадка её даёт"
                          value={commentUrl}
                          onChange={(e) => setCommentUrl(e.target.value)}
                          maxLength={1024}
                          disabled={disabled}
                        />
                      </>
                    )}
                  </section>
                </>
              )}

              <div className={styles.field}>
                <label htmlFor="snapshot-comment" className={ui.label}>
                  Комментарий заказчику
                </label>
                <textarea
                  id="snapshot-comment"
                  className={ui.textarea}
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={disabled}
                />
              </div>
            </>
          )}
        </>
      )}

      {formError && <p className={ui.errorText}>{formError}</p>}

      {placement && (
        <div className={styles.actions}>
          <button type="submit" className={ui.btnPrimary} disabled={disabled || !quote || quote.belowMinPaidViews}>
            {busy === 'submit' ? 'Подаём…' : 'Подать работу по расчёту'}
          </button>
          <Link to="/app/applications" className={ui.btnSecondary}>
            Позже
          </Link>
        </div>
      )}
    </form>
  );
};

export default SnapshotApply;

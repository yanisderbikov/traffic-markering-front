import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import PlatformList from '../shared/PlatformList/PlatformList';
import { formatRubles } from '../../shared/money';
import { CAMPAIGN_STATUS_LABELS, PLATFORM_LABELS } from '../../shared/dictionaries';
import { formatDay, periodState } from '../../shared/dates';
import { campaignRequirements } from '../../shared/requirements';
import { isWorldRegion, platformGeographyWarning, viewRegionHint } from '../../shared/viewRegion';
import { detectPlatform } from '../../shared/video';
import styles from './ApplyPage.module.css';

const emptyForm = {
  videoUrl: '',
  comment: '',
};

const ApplyPage = () => {
  const { publicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [videoUrlError, setVideoUrlError] = useState('');
  const [sending, setSending] = useState(false);
  const [accounts, setAccounts] = useState(null);

  const authorized = apiClient.hasLiveToken();
  const role = authorized ? apiClient.getJwtMetadata()?.role : null;
  const isCreator = role === 'CREATOR';

  const loadCampaign = useCallback(async () => {
    try {
      const res = await apiClient.api.boardCampaign(publicId);
      setCampaign(res.data);
      setPageError('');
    } catch (err) {
      setPageError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Не удалось загрузить объявление'
      );
    } finally {
      setLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    if (!isCreator) return;
    loadCampaign();
  }, [isCreator, loadCampaign]);

  useEffect(() => {
    if (!isCreator) return;
    apiClient.instance
      .get('/api/social/accounts')
      .then((res) => setAccounts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAccounts(null));
  }, [isCreator]);

  if (!authorized) {
    const from = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?from=${from}`} replace />;
  }
  if (!isCreator) {
    return <Navigate to={`/campaigns/${publicId}`} replace />;
  }

  const platform = detectPlatform(form.videoUrl);
  const acceptedPlatforms = Array.isArray(campaign?.platforms) ? campaign.platforms : [];
  const platformAccepted = !platform || acceptedPlatforms.includes(platform);
  const acceptedLabels = acceptedPlatforms
    .map((item) => PLATFORM_LABELS[item] || item)
    .join(', ');
  const hasAccount =
    accounts === null ||
    accounts.some((account) => account.platform === platform && account.status === 'ACTIVE');
  const worldRegion = isWorldRegion(campaign?.viewRegion);
  const regionHint = viewRegionHint(campaign?.viewRegion, campaign?.platforms);
  const geographyWarning = platformGeographyWarning(campaign?.viewRegion, platform);
  const activeYoutubeAccounts = Array.isArray(accounts)
    ? accounts.filter(
        (account) => account.platform === 'YOUTUBE_SHORTS' && account.status === 'ACTIVE'
      )
    : [];
  const youtubeWithoutAnalytics =
    platform === 'YOUTUBE_SHORTS' &&
    !worldRegion &&
    activeYoutubeAccounts.length > 0 &&
    !activeYoutubeAccounts.some((account) => account.reportsViewGeography === true);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'videoUrl') setVideoUrlError('');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const videoUrl = form.videoUrl.trim();
    if (!videoUrl) {
      setVideoUrlError('Укажите ссылку на ролик');
      return;
    }
    if (!platform) {
      setVideoUrlError('Площадка не распознана: принимаются YouTube, TikTok и Instagram');
      return;
    }
    if (!platformAccepted) {
      setVideoUrlError(
        `Заказчик не принимает ролики с ${PLATFORM_LABELS[platform]} — подходят: ${acceptedLabels}`
      );
      return;
    }

    setSending(true);
    setFormError('');
    try {
      await apiClient.api.apply({
        campaignId: campaign.id,
        videoUrl,
        comment: form.comment.trim() || null,
      });
      toast.success('Отклик отправлен — ждём решения заказчика');
      navigate('/app/applications');
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Не удалось отправить отклик'
      );
    } finally {
      setSending(false);
    }
  };

  const period = campaign ? periodState(campaign.startsAt, campaign.endsAt) : 'current';
  const inactive = campaign ? campaign.status !== 'ACTIVE' || period !== 'current' : false;
  const requirements = campaignRequirements(campaign);

  const renderInactiveNotice = () => {
    if (campaign.status !== 'ACTIVE') {
      return (
        <>
          объявление сейчас {CAMPAIGN_STATUS_LABELS[campaign.status] || campaign.status} — новые
          отклики заказчик не принимает.
        </>
      );
    }
    if (period === 'upcoming') {
      return <>приём откликов откроется {formatDay(campaign.startsAt)}.</>;
    }
    return <>приём откликов закончился {formatDay(campaign.endsAt)}.</>;
  };

  return (
    <div className={styles.wrap}>
      <Link to={`/campaigns/${publicId}`} className={styles.backLink}>
        ← к объявлению
      </Link>

      {loading ? (
        <p className={styles.message}>Загрузка объявления…</p>
      ) : pageError ? (
        <p className={styles.errorBanner}>{pageError}</p>
      ) : !campaign ? (
        <p className={styles.message}>Объявление не найдено.</p>
      ) : (
        <div className={styles.card}>
          <p className={styles.kicker}>отклик на объявление</p>
          <h1 className={styles.title}>{campaign.title}</h1>
          <p className={styles.meta}>
            {campaign.customerCompany || campaign.customerName}
            {' · '}
            <span className={styles.rate}>
              {formatRubles(campaign.ratePerThousandKopecks)}
            </span>{' '}
            / 1000 просмотров
          </p>
          {acceptedPlatforms.length > 0 && (
            <div className={styles.platformsRow}>
              <span className={styles.platformsLabel}>принимаются ролики с</span>
              <PlatformList platforms={acceptedPlatforms} />
            </div>
          )}

          {requirements.length > 0 && (
            <ul className={styles.requirements} aria-label="Требования к ролику">
              {requirements.map((row) => (
                <li key={row.key} className={styles.requirement} title={row.hint || undefined}>
                  <span className={styles.requirementKey}>{row.label}</span> {row.value}
                </li>
              ))}
            </ul>
          )}

          <p className={`${styles.regionNote} ${worldRegion ? '' : styles.regionNoteAccent}`}>
            {regionHint}
          </p>

          {inactive && <p className={styles.hintBanner}>{renderInactiveNotice()}</p>}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Field label="Ссылка на ролик *">
              <input
                type="url"
                name="videoUrl"
                value={form.videoUrl}
                onChange={setField}
                className={styles.input}
                aria-invalid={videoUrlError ? 'true' : undefined}
                maxLength={1024}
                disabled={sending || inactive}
                autoFocus
              />
              <FieldError>{videoUrlError}</FieldError>
              <span className={styles.hint}>
                по этой ссылке считаются просмотры, за которые начисляются деньги. площадка
                определяется автоматически и должна быть из списка заказчика.
              </span>
              {form.videoUrl.trim() && !platform && !videoUrlError && (
                <span className={styles.platformWarn}>площадка по ссылке не распознана.</span>
              )}
              {platform && !platformAccepted && !videoUrlError && (
                <span className={styles.platformWarn}>
                  заказчик не принимает ролики с {PLATFORM_LABELS[platform]} — подходят:{' '}
                  {acceptedLabels}.
                </span>
              )}
              {platform && platformAccepted && hasAccount && (
                <span className={styles.platformOk}>площадка: {PLATFORM_LABELS[platform]}</span>
              )}
              {platform && platformAccepted && geographyWarning && (
                <span className={styles.platformWarn}>{geographyWarning}</span>
              )}
              {platform && platformAccepted && hasAccount && youtubeWithoutAnalytics && (
                <span className={styles.platformWarn}>
                  YouTube подключён без доступа к аналитике — география просмотров не учтётся и
                  ролик по этому региону не оплатится.{' '}
                  <Link to="/app/profile" className={styles.inlineLink}>
                    переподключить YouTube
                  </Link>
                </span>
              )}
              {platform && platformAccepted && !hasAccount && (
                <span className={styles.platformWarn}>
                  {PLATFORM_LABELS[platform]} не привязан в профиле, отклик не примется.{' '}
                  <Link to="/app/profile" className={styles.inlineLink}>
                    привязать аккаунт
                  </Link>
                </span>
              )}
            </Field>
            <Field label="Комментарий заказчику">
              <textarea
                name="comment"
                value={form.comment}
                onChange={setField}
                className={`${styles.input} ${styles.textarea}`}
                rows={4}
                disabled={sending || inactive}
              />
            </Field>
            {formError && <p className={styles.error}>{formError}</p>}
            <div className={styles.actions}>
              <button type="submit" className={styles.submit} disabled={sending || inactive}>
                {sending ? 'Отправка…' : 'Отправить отклик'}
              </button>
              <Link to={`/campaigns/${publicId}`} className={styles.cancel}>
                отмена
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ApplyPage;

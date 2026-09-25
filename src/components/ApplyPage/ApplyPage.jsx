import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import Icon from '../shared/Icon/Icon';
import Skeleton, { SkeletonPageHead } from '../shared/Skeleton/Skeleton';
import { formatRubles } from '../../shared/money';
import { CAMPAIGN_STATUS_LABELS, PLATFORM_LABELS } from '../../shared/dictionaries';
import { formatDay, periodState } from '../../shared/dates';
import { campaignRequirements } from '../../shared/requirements';
import {
  DEFAULT_VIEW_REGION,
  isWorldRegion,
  platformGeographyWarning,
  viewRegionHint,
  viewRegionLabel,
} from '../../shared/viewRegion';
import { detectPlatform } from '../../shared/video';
import ui from '../../shared/ui.module.css';
import styles from './ApplyPage.module.css';

const ApplySkeleton = () => (
  <div aria-busy="true">
    <SkeletonPageHead eyebrow="Креатор" title="Отклик на оффер" />
    <div className={styles.columns}>
      <div className={`${ui.card} ${styles.form}`}>
        <div className={styles.field}>
          <span className={ui.label}>Ссылка на ролик *</span>
          <Skeleton block height={48} radius="var(--field-radius)" />
        </div>
        <div className={styles.field}>
          <span className={ui.label}>Комментарий заказчику</span>
          <Skeleton block height={120} radius="var(--field-radius)" />
        </div>
        <div className={styles.actions}>
          <Skeleton width="11rem" height={44} radius="var(--button-radius)" />
          <Skeleton width="7rem" height={44} radius="var(--button-radius)" />
        </div>
      </div>
      <aside className={styles.aside}>
        <section className={ui.card}>
          <span className={ui.eyebrow}>Ставка за результат</span>
          <p className={styles.rate}>
            <Skeleton width="5ch" />
          </p>
          <p className={styles.rateUnit}>за 1 000 подтверждённых просмотров</p>
          <div className={ui.divider} />
          <div className={ui.chips}>
            <Skeleton width="6rem" height={30} radius="999px" />
            <Skeleton width="5rem" height={30} radius="999px" />
          </div>
          <div className={ui.divider} />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={ui.kv}>
              <Skeleton width="8rem" />
              <Skeleton width="5rem" />
            </div>
          ))}
        </section>
      </aside>
    </div>
  </div>
);

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
          'Не удалось загрузить оффер'
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
  const customer = campaign?.customerCompany || campaign?.customerName || 'Заказчик';
  const campaignPath = `/campaigns/${publicId}`;

  const renderInactiveNotice = () => {
    if (campaign.status !== 'ACTIVE') {
      return (
        <>
          Оффер сейчас {CAMPAIGN_STATUS_LABELS[campaign.status] || campaign.status} — новые
          отклики заказчик не принимает.
        </>
      );
    }
    if (period === 'upcoming') {
      return <>Приём откликов откроется {formatDay(campaign.startsAt)}.</>;
    }
    return <>Приём откликов закончился {formatDay(campaign.endsAt)}.</>;
  };

  return (
    <div className={ui.page}>
      <Link to={campaignPath} className={ui.backLink}>
        <Icon name="arrowLeft" size={16} /> К офферу
      </Link>

      {loading ? (
        <ApplySkeleton />
      ) : pageError ? (
        <p className={ui.errorBanner}>{pageError}</p>
      ) : !campaign ? (
        <p className={ui.message}>Оффер не найден.</p>
      ) : (
        <>
          <header className={ui.pageHead}>
            <div className={ui.pageHeadMain}>
              <span className={ui.eyebrow}>Креатор</span>
              <h1 className={ui.title}>Отклик на оффер</h1>
              <p className={ui.subtitle}>
                {campaign.title} · {customer}
              </p>
            </div>
          </header>

          {inactive && <p className={styles.notice}>{renderInactiveNotice()}</p>}

          <div className={styles.columns}>
            <form className={`${ui.card} ${styles.form}`} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="apply-video-url" className={ui.label}>
                  Ссылка на ролик *
                </label>
                <input
                  id="apply-video-url"
                  type="url"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={setField}
                  className={ui.input}
                  placeholder="https://"
                  aria-invalid={videoUrlError ? 'true' : undefined}
                  maxLength={1024}
                  disabled={sending || inactive}
                  autoFocus
                />
                <FieldError>{videoUrlError}</FieldError>
                <span className={ui.hint}>
                  По этой ссылке считаются просмотры, за которые начисляются деньги. Площадка
                  определяется автоматически и должна быть из списка заказчика.
                </span>
                {form.videoUrl.trim() && !platform && !videoUrlError && (
                  <span className={ui.hintWarn}>Площадка по ссылке не распознана.</span>
                )}
                {platform && !platformAccepted && !videoUrlError && (
                  <span className={ui.hintWarn}>
                    Заказчик не принимает ролики с {PLATFORM_LABELS[platform]} — подходят:{' '}
                    {acceptedLabels}.
                  </span>
                )}
                {platform && platformAccepted && hasAccount && (
                  <span className={ui.hintOk}>Площадка: {PLATFORM_LABELS[platform]}</span>
                )}
                {platform && platformAccepted && geographyWarning && (
                  <span className={ui.hintWarn}>{geographyWarning}</span>
                )}
                {platform && platformAccepted && hasAccount && youtubeWithoutAnalytics && (
                  <span className={ui.hintWarn}>
                    YouTube подключён без доступа к аналитике — география просмотров не учтётся
                    и ролик по этому региону не оплатится.{' '}
                    <Link to="/app/profile" className={styles.inlineLink}>
                      Переподключить YouTube
                    </Link>
                  </span>
                )}
                {platform && platformAccepted && !hasAccount && (
                  <span className={ui.hintWarn}>
                    {PLATFORM_LABELS[platform]} не привязан в профиле, отклик не примется.{' '}
                    <Link to="/app/profile" className={styles.inlineLink}>
                      Привязать аккаунт
                    </Link>
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="apply-comment" className={ui.label}>
                  Комментарий заказчику
                </label>
                <textarea
                  id="apply-comment"
                  name="comment"
                  value={form.comment}
                  onChange={setField}
                  className={ui.textarea}
                  rows={4}
                  disabled={sending || inactive}
                />
                <span className={ui.hint}>
                  Необязательно. Расскажите, чем ваш ролик подходит под бриф.
                </span>
              </div>

              {formError && <p className={ui.errorText}>{formError}</p>}

              <div className={styles.actions}>
                <button
                  type="submit"
                  className={ui.btnPrimary}
                  disabled={sending || inactive}
                >
                  {sending ? 'Отправка…' : 'Отправить отклик'}
                </button>
                <Link to={campaignPath} className={ui.btnSecondary}>
                  Отмена
                </Link>
              </div>
            </form>

            <aside className={styles.aside}>
              <section className={ui.card}>
                <span className={ui.eyebrow}>Ставка за результат</span>
                <p className={styles.rate}>{formatRubles(campaign.ratePerThousandKopecks)}</p>
                <p className={styles.rateUnit}>за 1 000 подтверждённых просмотров</p>

                {acceptedPlatforms.length > 0 && (
                  <>
                    <div className={ui.divider} />
                    <span className={styles.blockLabel}>Принимаются ролики с</span>
                    <div className={ui.chips}>
                      {acceptedPlatforms.map((item) => (
                        <span key={item} className={ui.chip}>
                          <SocialIcon name={item} className={styles.chipIcon} />
                          {PLATFORM_LABELS[item] || item}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <div className={ui.divider} />
                {requirements.map((row) => (
                  <div key={row.key} className={ui.kv} title={row.hint || undefined}>
                    <span className={ui.kvKey}>{row.label}</span>
                    <span className={ui.kvValue}>{row.value}</span>
                  </div>
                ))}
                <div className={ui.kv}>
                  <span className={ui.kvKey}>Просмотры</span>
                  <span className={ui.kvValue}>
                    {viewRegionLabel(campaign.viewRegion || DEFAULT_VIEW_REGION)}
                  </span>
                </div>
                <p className={worldRegion ? styles.regionNote : styles.regionNoteAccent}>
                  {regionHint}
                </p>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
};

export default ApplyPage;

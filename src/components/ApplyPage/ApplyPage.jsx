import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import { formatRubles } from '../../shared/money';
import { CAMPAIGN_STATUS_LABELS, PLATFORM_LABELS, REGION_LABELS } from '../../shared/dictionaries';
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
  const hasAccount =
    accounts === null ||
    accounts.some((account) => account.platform === platform && account.status === 'ACTIVE');

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

  const inactive = campaign ? campaign.status !== 'ACTIVE' : false;

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

          <p className={styles.hintBanner}>
            оплачиваются только просмотры из региона «
            {REGION_LABELS[campaign.region] || campaign.regionDescription || campaign.region}» —
            просмотры из других стран в начисление не идут.
          </p>

          {inactive && (
            <p className={styles.hintBanner}>
              объявление сейчас {CAMPAIGN_STATUS_LABELS[campaign.status] || campaign.status} —
              новые отклики заказчик не принимает.
            </p>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <label className={styles.label}>
              Ссылка на ролик *
              <input
                type="url"
                name="videoUrl"
                value={form.videoUrl}
                onChange={setField}
                className={styles.input}
                aria-invalid={videoUrlError ? 'true' : undefined}
                placeholder="https://youtube.com/shorts/…"
                maxLength={1024}
                disabled={sending || inactive}
                autoFocus
              />
              <FieldError>{videoUrlError}</FieldError>
              <span className={styles.hint}>
                по этой ссылке считаются просмотры, за которые начисляются деньги. площадка
                определяется автоматически: YouTube, TikTok или Instagram.
              </span>
              {form.videoUrl.trim() && !platform && !videoUrlError && (
                <span className={styles.platformWarn}>площадка по ссылке не распознана.</span>
              )}
              {platform && hasAccount && (
                <span className={styles.platformOk}>площадка: {PLATFORM_LABELS[platform]}</span>
              )}
              {platform && !hasAccount && (
                <span className={styles.platformWarn}>
                  {PLATFORM_LABELS[platform]} не привязан в профиле, отклик не примется.{' '}
                  <Link to="/app/profile" className={styles.inlineLink}>
                    привязать аккаунт
                  </Link>
                </span>
              )}
            </label>
            <label className={styles.label}>
              Комментарий заказчику
              <textarea
                name="comment"
                value={form.comment}
                onChange={setField}
                className={`${styles.input} ${styles.textarea}`}
                rows={4}
                placeholder="Что за формат, когда выйдет ролик"
                disabled={sending || inactive}
              />
            </label>
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

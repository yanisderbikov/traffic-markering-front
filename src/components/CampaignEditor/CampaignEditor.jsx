import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import CreatorSocials from '../shared/CreatorSocials/CreatorSocials';
import FieldError from '../shared/FieldError/FieldError';
import { clearFieldError, hasErrors, validateRequired } from '../../shared/validation';
import {
  formatRubInput,
  formatRubles,
  formatViews,
  kopecksToRub,
  rubToKopecks,
} from '../../shared/money';
import {
  APPLICATION_STATUS_LABELS,
  CAMPAIGN_STATUS_LABELS,
  PLATFORM_LABELS,
  REGION_OPTIONS,
  formatDate,
} from '../../shared/dictionaries';
import styles from './CampaignEditor.module.css';

const emptyForm = {
  title: '',
  description: '',
  photoKey: '',
  rateRub: '',
  budgetRub: '',
  region: 'WORLDWIDE',
  status: 'DRAFT',
};

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;

// Статусы объявления в порядке жизненного цикла — так их и показываем в селекте.
const CAMPAIGN_STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];

// Заказчику разрешены только эти переходы отклика (см. правила бэка).
const APPLICATION_ACTIONS = [
  { status: 'APPROVED', label: 'Одобрить' },
  { status: 'REJECTED', label: 'Отклонить' },
  { status: 'COMPLETED', label: 'Завершить' },
];

const APPLICATION_STATUS_CLASS = {
  PENDING: styles.statusPending,
  APPROVED: styles.statusApproved,
  REJECTED: styles.statusRejected,
  COMPLETED: styles.statusCompleted,
};

// Копейки с бэка → строка для инпута в рублях.
const kopecksToInput = (kopecks) =>
  kopecks == null ? '' : formatRubInput(String(kopecksToRub(kopecks)));

const formFromCampaign = (campaign) => ({
  title: campaign.title || '',
  description: campaign.description || '',
  photoKey: campaign.photoKey || '',
  rateRub: kopecksToInput(campaign.ratePerThousandKopecks),
  budgetRub: kopecksToInput(campaign.budgetKopecks),
  region: campaign.region || 'WORLDWIDE',
  status: campaign.status || 'DRAFT',
});

const CampaignEditor = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  // 'new' в адресе — режим создания, всё остальное считаем идентификатором объявления.
  const isNew = campaignId === 'new';

  const [campaign, setCampaign] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [savedForm, setSavedForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(!isNew);
  const [applicationsError, setApplicationsError] = useState('');
  const [busyApplicationId, setBusyApplicationId] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // fillForm=true только при первой загрузке: после смены статуса отклика объявление
  // перечитывается ради пересчитанного бюджета, и затирать правки формы нельзя.
  const loadCampaign = useCallback(
    async ({ fillForm = false } = {}) => {
      try {
        const res = await apiClient.api.getCampaign(campaignId);
        setCampaign(res.data);
        if (fillForm) {
          const filled = formFromCampaign(res.data);
          setForm(filled);
          setSavedForm(filled);
          setPhotoPreview(res.data.photoUrl || '');
        }
        setPageError('');
      } catch (err) {
        setPageError(
          err?.response?.data?.message || err?.message || 'Не удалось загрузить объявление'
        );
      } finally {
        setLoading(false);
      }
    },
    [campaignId]
  );

  const loadApplications = useCallback(async () => {
    try {
      const res = await apiClient.api.campaignApplications(campaignId);
      setApplications(Array.isArray(res.data) ? res.data : []);
      setApplicationsError('');
    } catch (err) {
      setApplicationsError(
        err?.response?.data?.message || err?.message || 'Не удалось загрузить отклики'
      );
    } finally {
      setApplicationsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (isNew) {
      setCampaign(null);
      setForm(emptyForm);
      setSavedForm(emptyForm);
      setPhotoPreview('');
      setApplications([]);
      setPageError('');
      setLoading(false);
      setApplicationsLoading(false);
      return;
    }
    setLoading(true);
    setApplicationsLoading(true);
    loadCampaign({ fillForm: true });
    loadApplications();
  }, [isNew, loadCampaign, loadApplications]);

  useEffect(() => {
    if (!photoPreview.startsWith('blob:')) return undefined;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(setErrors, name);
    setError('');
  };

  const setMoneyField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: formatRubInput(value) }));
    clearFieldError(setErrors, name);
    setError('');
  };

  const invalid = (name) => (errors[name] ? 'true' : undefined);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      toast.error('Фотография — JPEG, PNG, WebP или GIF.');
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      toast.error('Фотография не больше 10 МБ.');
      return;
    }

    setUploadProgress(0);
    setError('');
    try {
      const res = await apiClient.api.presignCampaignPhoto({
        filename: file.name,
        contentType: file.type,
      });
      const { uploadUrl, key } = res.data;
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
      setForm((prev) => ({ ...prev, photoKey: key }));
      clearFieldError(setErrors, 'photoKey');
      setPhotoPreview(URL.createObjectURL(file));
      toast.success('Фотография загружена — не забудьте сохранить объявление');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Не удалось загрузить фотографию'
      );
    } finally {
      setUploadProgress(null);
    }
  };

  const dirty = Object.keys(form).some((key) => form[key] !== savedForm[key]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    // Пользователь вводит рубли, бэк принимает копейки — конвертируем здесь.
    const ratePerThousandKopecks = rubToKopecks(form.rateRub);
    const budgetKopecks = rubToKopecks(form.budgetRub);

    const nextErrors = {
      title: validateRequired(title, 'Укажите заголовок'),
      description: validateRequired(description, 'Опишите задачу для криатора'),
      photoKey: form.photoKey ? '' : 'Загрузите фотографию',
      rateRub:
        ratePerThousandKopecks == null || ratePerThousandKopecks <= 0
          ? 'Ставка должна быть больше нуля'
          : '',
      budgetRub: budgetKopecks == null || budgetKopecks < 0 ? 'Сумма в рублях, ноль или больше' : '',
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const res = await apiClient.api.createCampaign({
          title,
          description,
          photoKey: form.photoKey,
          ratePerThousandKopecks,
          budgetKopecks,
          region: form.region,
          status: form.status,
        });
        toast.success('Объявление создано');
        navigate(`/app/campaigns/${res.data.id}`, { replace: true });
        return;
      }

      const res = await apiClient.api.updateCampaign(campaignId, {
        title,
        description,
        photoKey: form.photoKey,
        ratePerThousandKopecks,
        budgetKopecks,
        region: form.region,
      });
      let saved = res.data;
      // Статус в теле PUT не отправляем: бэк меняет его, только если поле пришло,
      // и тогда смена статуса шла бы то одной ручкой, то другой. Держим её на PATCH —
      // там же, где её делает список объявлений.
      if (form.status && form.status !== saved.status) {
        const patched = await apiClient.api.updateCampaignStatus(campaignId, {
          status: form.status,
        });
        saved = patched.data;
      }
      setCampaign(saved);
      const savedFields = formFromCampaign(saved);
      setForm(savedFields);
      setSavedForm(savedFields);
      setPhotoPreview(saved.photoUrl || '');
      toast.success('Объявление сохранено');
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Не удалось сохранить объявление'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Удалить объявление «${campaign?.title || form.title}»?`)) return;
    setDeleting(true);
    try {
      await apiClient.api.deleteCampaign(campaignId);
      toast.success('Объявление удалено');
      navigate('/app/campaigns', { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Не удалось удалить объявление'
      );
      setDeleting(false);
    }
  };

  const handleApplicationStatus = async (application, status) => {
    setBusyApplicationId(application.id);
    try {
      await apiClient.api.updateApplicationStatus(application.id, { status });
      toast.success(`Отклик: ${APPLICATION_STATUS_LABELS[status] || status}`);
      // Начисления пересчитываются на бэке по всему объявлению — обновляем и бюджет.
      await Promise.all([loadApplications(), loadCampaign()]);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Не удалось сменить статус отклика'
      );
    } finally {
      setBusyApplicationId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.wrap}>
        <p className={styles.message}>Загрузка объявления…</p>
      </div>
    );
  }

  if (pageError && !campaign) {
    return (
      <div className={styles.wrap}>
        <p className={styles.banner}>{pageError}</p>
        <Link to="/app/campaigns" className={styles.backLink}>
          ← ко всем объявлениям
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <Link to="/app/campaigns" className={styles.backLink}>
        ← ко всем объявлениям
      </Link>
      <h1 className={styles.title}>{isNew ? 'Новое объявление' : 'Редактирование объявления'}</h1>

      {campaign && (
        <section className={styles.card}>
          <div className={styles.summaryHead}>
            <p className={styles.rate}>
              {formatRubles(campaign.ratePerThousandKopecks)}
              <span className={styles.rateUnit}> / 1000 просмотров</span>
            </p>
            <p className={styles.summaryMeta}>
              регион: {campaign.regionDescription || campaign.region || '—'}
              {' · '}
              откликов: {campaign.applicationsCount ?? 0}
              {' · '}
              просмотров: {formatViews(campaign.totalViews ?? 0)}
            </p>
          </div>
          <BudgetBar
            budgetKopecks={campaign.budgetKopecks}
            spentKopecks={campaign.spentKopecks}
          />
        </section>
      )}

      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.cardTitle}>Условия</h2>
        <div className={styles.formGrid}>
          <div className={`${styles.label} ${styles.labelWide}`}>
            Фотография *
            <div className={styles.photoRow}>
              {photoPreview && (
                <div className={styles.photoPreview}>
                  <img
                    className={styles.photoBackdrop}
                    src={photoPreview}
                    alt=""
                    aria-hidden="true"
                  />
                  <img className={styles.photoImage} src={photoPreview} alt="Фото объявления" />
                </div>
              )}
              <label
                className={`${styles.photoAdd} ${
                  uploadProgress !== null ? styles.photoAddBusy : ''
                }`}
                title={photoPreview ? 'Заменить фото' : 'Добавить фото'}
              >
                {uploadProgress !== null ? `${uploadProgress}%` : '+'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoChange}
                  className={styles.photoInput}
                  disabled={uploadProgress !== null}
                />
              </label>
              <div className={styles.photoControls}>
                {uploadProgress !== null && (
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                <span className={styles.hint}>
                  {photoPreview
                    ? 'Плюс заменит фото на новое.'
                    : 'Нажмите на плюс и выберите фото.'}{' '}
                  JPEG, PNG, WebP или GIF до 10 МБ. На доске превью 100 px высотой,
                  пустые края зальются размытым фоном.
                </span>
                <FieldError>{errors.photoKey}</FieldError>
              </div>
            </div>
          </div>
          <label className={`${styles.label} ${styles.labelWide}`}>
            Заголовок *
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={setField}
              className={styles.input}
              aria-invalid={invalid('title')}
              placeholder="Интеграция в Shorts про кофе"
              maxLength={255}
              autoComplete="off"
            />
            <FieldError>{errors.title}</FieldError>
          </label>
          <label className={`${styles.label} ${styles.labelWide}`}>
            Описание задачи *
            <textarea
              name="description"
              value={form.description}
              onChange={setField}
              className={styles.textarea}
              aria-invalid={invalid('description')}
              placeholder="Что показать, что сказать, какие обязательные тезисы и ссылки."
              rows={6}
            />
            <FieldError>{errors.description}</FieldError>
          </label>
          <label className={styles.label}>
            Ставка за 1000 просмотров, ₽ *
            <input
              type="text"
              inputMode="decimal"
              name="rateRub"
              value={form.rateRub}
              onChange={setMoneyField}
              className={styles.input}
              aria-invalid={invalid('rateRub')}
              placeholder="350"
              autoComplete="off"
            />
            <FieldError>{errors.rateRub}</FieldError>
          </label>
          <label className={styles.label}>
            Бюджет, ₽ *
            <input
              type="text"
              inputMode="decimal"
              name="budgetRub"
              value={form.budgetRub}
              onChange={setMoneyField}
              className={styles.input}
              aria-invalid={invalid('budgetRub')}
              placeholder="50 000"
              autoComplete="off"
            />
            <FieldError>{errors.budgetRub}</FieldError>
            <span className={styles.hint}>
              Больше этой суммы криаторам не начислится: кончился бюджет — начисления обрезаются.
            </span>
          </label>
          <label className={styles.label}>
            Регион просмотров
            <select
              name="region"
              value={form.region}
              onChange={setField}
              className={styles.input}
            >
              {REGION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className={styles.hint}>
              В оплату идут только просмотры из выбранного региона; криатор увидит его до того,
              как снимет ролик. Смена региона обнуляет уже подтверждённую гео-разбивку по
              откликам.
            </span>
          </label>
          <label className={styles.label}>
            Статус
            <select
              name="status"
              value={form.status}
              onChange={setField}
              className={styles.input}
            >
              {CAMPAIGN_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {CAMPAIGN_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <span className={styles.hint}>На доске объявлений видны только активные.</span>
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.submit} ${dirty ? '' : styles.submitIdle}`}
            disabled={saving || uploadProgress !== null || !dirty}
          >
            {saving ? 'Сохранение…' : isNew ? 'Создать объявление' : 'Сохранить'}
          </button>
          <Link to="/app/campaigns" className={styles.cancelBtn}>
            Отмена
          </Link>
          {!isNew && (
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? 'Удаление…' : 'Удалить'}
            </button>
          )}
        </div>
      </form>

      {!isNew && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Отклики</h2>
          {applicationsError && <p className={styles.banner}>{applicationsError}</p>}
          {applicationsLoading ? (
            <p className={styles.message}>Загрузка откликов…</p>
          ) : applications.length === 0 ? (
            <p className={styles.message}>
              Откликов пока нет. Активное объявление видно криаторам на доске.
            </p>
          ) : (
            <ul className={styles.list}>
              {applications.map((application) => (
                <li key={application.id} className={styles.item}>
                  <div className={styles.itemHead}>
                    <span className={styles.creator}>{application.creatorName}</span>
                    <span
                      className={`${styles.status} ${
                        APPLICATION_STATUS_CLASS[application.status] || ''
                      }`}
                    >
                      {application.statusDescription ||
                        APPLICATION_STATUS_LABELS[application.status] ||
                        application.status}
                    </span>
                  </div>

                  <p className={styles.itemMeta}>
                    {application.platformDescription ||
                      PLATFORM_LABELS[application.platform] ||
                      application.platform}
                    {application.creatorTelegram ? ` · ${application.creatorTelegram}` : ''}
                    {' · '}
                    {formatDate(application.createdAt)}
                  </p>

                  <a
                    className={styles.videoLink}
                    href={application.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {application.videoUrl}
                  </a>

                  {application.comment && (
                    <p className={styles.comment}>{application.comment}</p>
                  )}

                  <CreatorSocials userId={application.creatorId} />

                  <p className={styles.numbers}>
                    просмотров: <b>{formatViews(application.views ?? 0)}</b>
                    {' · '}
                    начислено: <b>{formatRubles(application.accruedKopecks ?? 0)}</b>
                  </p>

                  <div className={styles.actions}>
                    {APPLICATION_ACTIONS.filter(
                      (action) => action.status !== application.status
                    ).map((action) => (
                      <button
                        key={action.status}
                        type="button"
                        className={
                          action.status === 'REJECTED' ? styles.rejectBtn : styles.actionBtn
                        }
                        onClick={() => handleApplicationStatus(application, action.status)}
                        disabled={busyApplicationId === application.id}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default CampaignEditor;

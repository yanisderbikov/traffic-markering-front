import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import WalletSummary from '../shared/WalletSummary/WalletSummary';
import CreatorSocials from '../shared/CreatorSocials/CreatorSocials';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import MaterialList from '../shared/MaterialList/MaterialList';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import { FraudBadge, FraudFlags, TrustBadge } from '../shared/FraudBadge/FraudBadge';
import { clearFieldError, hasErrors, validateRequired } from '../../shared/validation';
import { VIDEO_PLATFORMS } from '../../shared/video';
import {
  DEFAULT_VIEW_REGION,
  VIEW_REGIONS,
  platformLabels,
  platformsWithoutGeography,
  viewRegionLabel,
} from '../../shared/viewRegion';
import {
  formatIntInput,
  formatRubInput,
  formatRubles,
  formatViews,
  kopecksToRub,
  parseIntInput,
  rubToKopecks,
} from '../../shared/money';
import { dateInputValue, endOfDayIso, startOfDayIso } from '../../shared/dates';
import {
  APPLICATION_STATUS_LABELS,
  CAMPAIGN_STATUS_LABELS,
  PLATFORM_LABELS,
  formatDate,
} from '../../shared/dictionaries';
import styles from './CampaignEditor.module.css';

const emptyForm = {
  title: '',
  description: '',
  photoKey: '',
  rateRub: '',
  budgetRub: '',
  minPayoutRub: '',
  status: 'DRAFT',
  platforms: VIDEO_PLATFORMS,
  viewRegion: DEFAULT_VIEW_REGION,
  minVideoSeconds: '',
  minPaidViews: '',
  maxVideosPerCreator: '',
  startsOn: '',
  endsOn: '',
  materials: [],
};

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const MATERIAL_MAX_BYTES = 100 * 1024 * 1024;
const MATERIALS_MAX = 10;

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

const sameValue = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return a === b;
  if (a.length !== b.length) return false;
  return a.every((item, index) =>
    item && typeof item === 'object'
      ? JSON.stringify(item) === JSON.stringify(b[index])
      : b.includes(item)
  );
};

const intToInput = (value) => (value == null ? '' : formatIntInput(String(value)));

const materialFromDto = (material) => ({
  kind: material.kind,
  title: material.title || '',
  url: material.url || '',
  fileKey: material.fileKey || '',
  contentType: material.contentType || '',
  sizeBytes: material.sizeBytes ?? null,
  opensInBrowser: Boolean(material.opensInBrowser),
});

const materialToRequest = (material) =>
  material.kind === 'FILE'
    ? {
        kind: 'FILE',
        title: material.title,
        fileKey: material.fileKey,
        contentType: material.contentType || null,
        sizeBytes: material.sizeBytes,
      }
    : { kind: 'LINK', title: material.title, url: material.url };

const normalizeLink = (value) => {
  const raw = value.trim();
  if (!raw) return '';
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes('.') ? url.toString() : '';
  } catch {
    return '';
  }
};

const formFromCampaign = (campaign) => ({
  title: campaign.title || '',
  description: campaign.description || '',
  photoKey: campaign.photoKey || '',
  rateRub: kopecksToInput(campaign.ratePerThousandKopecks),
  budgetRub: kopecksToInput(campaign.budgetKopecks),
  minPayoutRub: kopecksToInput(campaign.minPayoutKopecks),
  status: campaign.status || 'DRAFT',
  platforms: Array.isArray(campaign.platforms) ? campaign.platforms : [],
  viewRegion: campaign.viewRegion || DEFAULT_VIEW_REGION,
  minVideoSeconds: intToInput(campaign.minVideoSeconds),
  minPaidViews: intToInput(campaign.minPaidViews),
  maxVideosPerCreator: intToInput(campaign.maxVideosPerCreator),
  startsOn: dateInputValue(campaign.startsAt),
  endsOn: dateInputValue(campaign.endsAt),
  materials: Array.isArray(campaign.materials) ? campaign.materials.map(materialFromDto) : [],
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
  const [materialProgress, setMaterialProgress] = useState(null);
  const [link, setLink] = useState({ url: '', title: '' });
  const [linkError, setLinkError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [wallet, setWallet] = useState(null);
  const ownsWallet = apiClient.getJwtMetadata()?.role === 'CUSTOMER';

  const loadWallet = useCallback(async () => {
    try {
      const res = await apiClient.api.myWallet();
      setWallet(res.data);
    } catch {
      setWallet(null);
    }
  }, []);

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
    loadWallet();
  }, [loadWallet]);

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

  const setIntField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: formatIntInput(value) }));
    clearFieldError(setErrors, name);
    setError('');
  };

  const addMaterial = (material) => {
    setForm((prev) => ({ ...prev, materials: [...prev.materials, material] }));
    clearFieldError(setErrors, 'materials');
    setError('');
  };

  const removeMaterial = (index) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, position) => position !== index),
    }));
    setError('');
  };

  const materialsFull = form.materials.length >= MATERIALS_MAX;

  const handleMaterialChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (materialsFull) {
      toast.error(`Не больше ${MATERIALS_MAX} материалов.`);
      return;
    }
    if (file.size > MATERIAL_MAX_BYTES) {
      toast.error('Файл не больше 100 МБ — большие материалы приложите ссылкой.');
      return;
    }
    const contentType = file.type || 'application/octet-stream';

    setMaterialProgress(0);
    setError('');
    try {
      const res = await apiClient.api.presignCampaignMaterial({
        filename: file.name,
        contentType,
      });
      const { uploadUrl, key } = res.data;
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': contentType },
        onUploadProgress: (event) => {
          if (event.total) {
            setMaterialProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });
      addMaterial({
        kind: 'FILE',
        title: file.name.slice(0, 255),
        url: '',
        fileKey: key,
        contentType,
        sizeBytes: file.size,
        opensInBrowser: false,
      });
      toast.success('Файл загружен — не забудьте сохранить объявление');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Не удалось загрузить файл');
    } finally {
      setMaterialProgress(null);
    }
  };

  const handleAddLink = () => {
    const url = normalizeLink(link.url);
    if (!url) {
      setLinkError('Укажите адрес ссылки, например disk.yandex.ru/d/…');
      return;
    }
    if (materialsFull) {
      setLinkError(`Не больше ${MATERIALS_MAX} материалов.`);
      return;
    }
    addMaterial({
      kind: 'LINK',
      title: link.title.trim() || url,
      url,
      fileKey: '',
      contentType: '',
      sizeBytes: null,
      opensInBrowser: true,
    });
    setLink({ url: '', title: '' });
    setLinkError('');
  };

  const setLinkField = (e) => {
    const { name, value } = e.target;
    setLink((prev) => ({ ...prev, [name]: value }));
    setLinkError('');
  };

  const addLinkOnEnter = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    handleAddLink();
  };

  const updatePlatforms = (next) => {
    setForm((prev) => ({ ...prev, platforms: next(prev.platforms) }));
    clearFieldError(setErrors, 'platforms');
    setError('');
  };

  const togglePlatform = (platform) =>
    updatePlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );

  const selectAllPlatforms = () => updatePlatforms(() => VIDEO_PLATFORMS);

  const clearPlatforms = () => updatePlatforms(() => []);

  const setViewRegion = (region) => {
    setForm((prev) => ({ ...prev, viewRegion: region }));
    clearFieldError(setErrors, 'viewRegion');
    setError('');
  };

  const blindPlatforms = platformsWithoutGeography(form.platforms);
  const regionBlindWarning = form.viewRegion !== 'WORLD' && blindPlatforms.length > 0;

  const allPlatformsSelected = VIDEO_PLATFORMS.every((platform) =>
    form.platforms.includes(platform)
  );

  const invalid = (name) => (errors[name] ? 'true' : undefined);

  // На создании спойлер свёрнут; при редактировании раскрываем, если там что-то заполнено.
  const extraOpen =
    !isNew &&
    ['minVideoSeconds', 'minPaidViews', 'maxVideosPerCreator', 'startsOn', 'endsOn'].some(
      (key) => Boolean(savedForm[key])
    );

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

  const dirty = Object.keys(form).some((key) => !sameValue(form[key], savedForm[key]));

  const savedBudgetKopecks = campaign?.budgetKopecks ?? 0;
  const spentKopecks = campaign?.spentKopecks ?? 0;
  const availableKopecks = wallet ? (wallet.balanceKopecks ?? 0) + savedBudgetKopecks : null;

  const budgetError = (budgetKopecks) => {
    if (budgetKopecks == null || budgetKopecks < 0) return 'Сумма в рублях, ноль или больше';
    if (!isNew && budgetKopecks < spentKopecks) {
      return `Нельзя опустить ниже уже начисленного: ${formatRubles(spentKopecks)}`;
    }
    if (ownsWallet && availableKopecks != null && budgetKopecks > availableKopecks) {
      return `Не хватает средств в кошельке: доступно ${formatRubles(availableKopecks)}`;
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    // Пользователь вводит рубли, бэк принимает копейки — конвертируем здесь.
    const ratePerThousandKopecks = rubToKopecks(form.rateRub);
    const budgetKopecks = rubToKopecks(form.budgetRub);
    const minPayoutKopecks = rubToKopecks(form.minPayoutRub);
    const minVideoSeconds = parseIntInput(form.minVideoSeconds);
    const minPaidViews = parseIntInput(form.minPaidViews);
    const maxVideosPerCreator = parseIntInput(form.maxVideosPerCreator);
    const startsAt = startOfDayIso(form.startsOn);
    const endsAt = endOfDayIso(form.endsOn);
    const positiveOrEmpty = (value, message) => (value != null && value <= 0 ? message : '');

    const nextErrors = {
      title: validateRequired(title, 'Укажите заголовок'),
      description: validateRequired(description, 'Опишите задачу для криатора'),
      photoKey: form.photoKey ? '' : 'Загрузите фотографию',
      rateRub:
        ratePerThousandKopecks == null || ratePerThousandKopecks <= 0
          ? 'Ставка должна быть больше нуля'
          : '',
      budgetRub: budgetError(budgetKopecks),
      minPayoutRub:
        minPayoutKopecks == null || minPayoutKopecks <= 0
          ? 'Порог вывода должен быть больше нуля'
          : '',
      platforms: form.platforms.length ? '' : 'Выберите хотя бы одну площадку',
      viewRegion: VIEW_REGIONS.includes(form.viewRegion) ? '' : 'Выберите регион просмотров',
      minVideoSeconds: positiveOrEmpty(minVideoSeconds, 'Длина ролика — целое число секунд'),
      minPaidViews: positiveOrEmpty(minPaidViews, 'Порог просмотров должен быть больше нуля'),
      maxVideosPerCreator: positiveOrEmpty(maxVideosPerCreator, 'Лимит роликов должен быть больше нуля'),
      endsOn:
        startsAt && endsAt && endsAt < startsAt ? 'Окончание приёма раньше его начала' : '',
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const requirements = {
      minVideoSeconds,
      minPaidViews,
      maxVideosPerCreator,
      startsAt,
      endsAt,
      materials: form.materials.map(materialToRequest),
    };

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
          minPayoutKopecks,
          platforms: form.platforms,
          viewRegion: form.viewRegion,
          ...requirements,
          status: form.status,
        });
        toast.success('Объявление создано');
        loadWallet();
        navigate(`/app/campaigns/${res.data.id}`, { replace: true });
        return;
      }

      const res = await apiClient.api.updateCampaign(campaignId, {
        title,
        description,
        photoKey: form.photoKey,
        ratePerThousandKopecks,
        budgetKopecks,
        minPayoutKopecks,
        platforms: form.platforms,
        viewRegion: form.viewRegion,
        ...requirements,
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
      loadWallet();
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

      {isNew && wallet && (
        <section className={styles.walletBlock}>
          <WalletSummary wallet={wallet} />
        </section>
      )}

      {campaign && (
        <section className={styles.card}>
          <div className={styles.summaryHead}>
            <p className={styles.rate}>
              {formatRubles(campaign.ratePerThousandKopecks)}
              <span className={styles.rateUnit}> / 1000 просмотров</span>
            </p>
            <p className={styles.summaryMeta}>
              откликов: {campaign.applicationsCount ?? 0}
              {' · '}
              просмотров: {formatViews(campaign.totalViews ?? 0)}
              {' · '}
              регион: {viewRegionLabel(campaign.viewRegion || DEFAULT_VIEW_REGION)}
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
          <Field label="Заголовок *" className={styles.labelWide}>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={setField}
              className={styles.input}
              aria-invalid={invalid('title')}
              maxLength={255}
              autoComplete="off"
            />
            <FieldError>{errors.title}</FieldError>
          </Field>
          <Field label="Описание задачи *" className={styles.labelWide}>
            <textarea
              name="description"
              value={form.description}
              onChange={setField}
              className={styles.textarea}
              aria-invalid={invalid('description')}
              rows={6}
            />
            <FieldError>{errors.description}</FieldError>
          </Field>
          <div className={`${styles.label} ${styles.labelWide}`}>
            Площадки *
            <div className={styles.platforms} role="group" aria-label="Площадки">
              {VIDEO_PLATFORMS.map((platform) => {
                const selected = form.platforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    className={`${styles.platform} ${selected ? styles.platformSelected : ''}`}
                    onClick={() => togglePlatform(platform)}
                    aria-pressed={selected}
                  >
                    <SocialIcon name={platform} className={styles.platformIcon} />
                    {PLATFORM_LABELS[platform]}
                  </button>
                );
              })}
            </div>
            <div className={styles.platformsBulk}>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={selectAllPlatforms}
                disabled={allPlatformsSelected}
              >
                выбрать все
              </button>
              <button
                type="button"
                className={styles.linkBtn}
                onClick={clearPlatforms}
                disabled={form.platforms.length === 0}
              >
                убрать все
              </button>
            </div>
            <FieldError>{errors.platforms}</FieldError>
            <span className={styles.hint}>
              Криатор сможет подать ролик только с выбранных площадок — ссылку с другой
              площадки отклик не примет.
            </span>
          </div>
          <div className={`${styles.label} ${styles.labelWide}`}>
            Регион просмотров *
            <div className={styles.platforms} role="radiogroup" aria-label="Регион просмотров">
              {VIEW_REGIONS.map((region) => {
                const selected = form.viewRegion === region;
                return (
                  <button
                    key={region}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`${styles.platform} ${selected ? styles.platformSelected : ''}`}
                    onClick={() => setViewRegion(region)}
                  >
                    {viewRegionLabel(region)}
                  </button>
                );
              })}
            </div>
            <FieldError>{errors.viewRegion}</FieldError>
            <span className={styles.hint}>
              Оплачиваются только просмотры из выбранного региона; «весь мир» — все просмотры.
              {regionBlindWarning && (
                <>
                  {' '}
                  <span className={styles.hintWarn}>
                    {platformLabels(blindPlatforms)} географию просмотров{' '}
                    {blindPlatforms.length > 1 ? 'не отдают' : 'не отдаёт'} — ролики оттуда по
                    такому региону не оплатятся; географию отдаёт только YouTube (криатор
                    должен подключить канал с доступом к аналитике).
                  </span>
                </>
              )}
            </span>
          </div>
          <Field label="Ставка за 1000 просмотров, ₽ *">
            <input
              type="text"
              inputMode="decimal"
              name="rateRub"
              value={form.rateRub}
              onChange={setMoneyField}
              className={styles.input}
              aria-invalid={invalid('rateRub')}
              autoComplete="off"
            />
            <FieldError>{errors.rateRub}</FieldError>
          </Field>
          <Field label="Бюджет, ₽ *">
            <input
              type="text"
              inputMode="decimal"
              name="budgetRub"
              value={form.budgetRub}
              onChange={setMoneyField}
              className={styles.input}
              aria-invalid={invalid('budgetRub')}
              autoComplete="off"
            />
            <FieldError>{errors.budgetRub}</FieldError>
            <span className={styles.hint}>
              Бюджет резервируется из кошелька.
              {availableKopecks != null && (
                <>
                  {' '}
                  Доступно {formatRubles(availableKopecks)}
                  {!isNew && savedBudgetKopecks > 0
                    ? ` (из них ${formatRubles(savedBudgetKopecks)} уже в этом объявлении)`
                    : ''}
                  .
                </>
              )}{' '}
              <Link to="/app/wallet" className={styles.hintLink}>
                Кошелёк
              </Link>
            </span>
          </Field>
          <Field label="Вывод от, ₽ *">
            <input
              type="text"
              inputMode="decimal"
              name="minPayoutRub"
              value={form.minPayoutRub}
              onChange={setMoneyField}
              className={styles.input}
              aria-invalid={invalid('minPayoutRub')}
              autoComplete="off"
            />
            <FieldError>{errors.minPayoutRub}</FieldError>
            <span className={styles.hint}>
              Криатор сможет вывести заработанное по объявлению, когда накопит эту сумму. До
              порога начисления копятся на откликах и в кошелёк не попадают.
            </span>
          </Field>
          <Field label="Статус">
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
          </Field>
        </div>

        <details className={styles.extra} open={extraOpen}>
          <summary className={styles.extraSummary}>
            <span className={styles.cardTitle}>Дополнительно</span>
            <span className={styles.extraNote}>сроки, пороги, лимит роликов</span>
          </summary>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              Длина ролика от, сек
              <input
                type="text"
                inputMode="numeric"
                name="minVideoSeconds"
                value={form.minVideoSeconds}
                onChange={setIntField}
                className={styles.input}
                aria-invalid={invalid('minVideoSeconds')}
                autoComplete="off"
              />
              <FieldError>{errors.minVideoSeconds}</FieldError>
              <span className={styles.hint}>Проверяете вручную.</span>
            </label>
            <label className={styles.label}>
              Оплата от, просмотров
              <input
                type="text"
                inputMode="numeric"
                name="minPaidViews"
                value={form.minPaidViews}
                onChange={setIntField}
                className={styles.input}
                aria-invalid={invalid('minPaidViews')}
                autoComplete="off"
              />
              <FieldError>{errors.minPaidViews}</FieldError>
              <span className={styles.hint}>Ниже порога ролик не оплачивается.</span>
            </label>
            <label className={styles.label}>
              Роликов от одного криатора
              <input
                type="text"
                inputMode="numeric"
                name="maxVideosPerCreator"
                value={form.maxVideosPerCreator}
                onChange={setIntField}
                className={styles.input}
                aria-invalid={invalid('maxVideosPerCreator')}
                autoComplete="off"
              />
              <FieldError>{errors.maxVideosPerCreator}</FieldError>
            </label>
            <div className={`${styles.label} ${styles.labelWide}`}>
              Приём откликов
              <div className={styles.dateRange}>
                <input
                  type="date"
                  name="startsOn"
                  value={form.startsOn}
                  onChange={setField}
                  className={styles.input}
                  aria-invalid={invalid('startsOn')}
                  aria-label="Приём откликов с"
                />
                <span className={styles.dateDash}>—</span>
                <input
                  type="date"
                  name="endsOn"
                  value={form.endsOn}
                  onChange={setField}
                  min={form.startsOn || undefined}
                  className={styles.input}
                  aria-invalid={invalid('endsOn')}
                  aria-label="Приём откликов до"
                />
              </div>
              <FieldError>{errors.startsOn || errors.endsOn}</FieldError>
              <span className={styles.hint}>По Москве, включительно.</span>
            </div>
          </div>
        </details>

        <h2 className={`${styles.cardTitle} ${styles.sectionTitle}`}>Материалы для криатора</h2>
        <p className={styles.sectionLead}>
          Бриф, баннеры, референсы — файлом или ссылкой. Криатор откроет или скачает их со
          страницы объявления.
        </p>
        <MaterialList
          materials={form.materials}
          onRemove={removeMaterial}
          className={styles.materials}
        />
        <div className={styles.materialAdd}>
          <label
            className={`${styles.materialFile} ${
              materialProgress !== null || materialsFull ? styles.materialFileBusy : ''
            }`}
          >
            {materialProgress !== null ? `загрузка ${materialProgress}%` : '+ файл'}
            <input
              type="file"
              onChange={handleMaterialChange}
              className={styles.photoInput}
              disabled={materialProgress !== null || materialsFull}
            />
          </label>
          <div className={styles.linkForm}>
            <Field label="Ссылка" className={styles.linkField}>
              <input
                type="text"
                name="url"
                value={link.url}
                onChange={setLinkField}
                onKeyDown={addLinkOnEnter}
                className={styles.input}
                aria-invalid={linkError ? 'true' : undefined}
                maxLength={2048}
                autoComplete="off"
                disabled={materialsFull}
              />
            </Field>
            <Field label="Подпись" className={styles.linkField}>
              <input
                type="text"
                name="title"
                value={link.title}
                onChange={setLinkField}
                onKeyDown={addLinkOnEnter}
                className={styles.input}
                maxLength={255}
                autoComplete="off"
                disabled={materialsFull}
              />
            </Field>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleAddLink}
              disabled={materialsFull}
            >
              + ссылка
            </button>
          </div>
        </div>
        <FieldError>{linkError}</FieldError>
        <p className={styles.sectionLead}>
          Файлы до 100 МБ, всего до {MATERIALS_MAX} материалов. Загруженный файл станет
          доступен криаторам после сохранения объявления.
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.submit} ${dirty ? '' : styles.submitIdle}`}
            disabled={saving || uploadProgress !== null || materialProgress !== null || !dirty}
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
                    <span className={styles.creator}>
                      {application.creatorName}{' '}
                      <TrustBadge level={application.creatorTrustLevel} />
                    </span>
                    <span className={styles.itemBadges}>
                      <FraudBadge status={application.fraudStatus} />
                      <span
                        className={`${styles.status} ${
                          APPLICATION_STATUS_CLASS[application.status] || ''
                        }`}
                      >
                        {application.statusDescription ||
                          APPLICATION_STATUS_LABELS[application.status] ||
                          application.status}
                      </span>
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
                    {application.campaignViewRegion &&
                      application.campaignViewRegion !== 'WORLD' && (
                        <>
                          {' · '}
                          {application.viewsGeographyKnown === false ? (
                            <span className={styles.numbersWarn}>
                              география недоступна — в расчёт не идут
                            </span>
                          ) : (
                            <>
                              в расчёт: <b>{formatViews(application.payableViews ?? 0)}</b>
                            </>
                          )}
                        </>
                      )}
                    {' · '}
                    начислено: <b>{formatRubles(application.accruedKopecks ?? 0)}</b>
                  </p>

                  {application.fraudStatus === 'SUSPICIOUS' && (
                    <p className={styles.fraudNote}>
                      Антифрод заметил признаки накрутки: деньги криатору заморожены до решения
                      платформы. Вы можете отклонить отклик сами.
                    </p>
                  )}
                  {application.fraudStatus === 'FRAUD' && (
                    <p className={styles.fraudNote}>
                      Накрутка: начисление по ролику обнулено, бюджет не тратится.
                    </p>
                  )}
                  <FraudFlags flags={application.fraudFlags} />

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

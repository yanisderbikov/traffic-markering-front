import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import BudgetBar from '../shared/BudgetBar/BudgetBar';
import CreatorSocials from '../shared/CreatorSocials/CreatorSocials';
import FieldError from '../shared/FieldError/FieldError';
import MaterialList from '../shared/MaterialList/MaterialList';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import Icon from '../shared/Icon/Icon';
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
import { dateInputValue, endOfDayIso, formatDay, startOfDayIso } from '../../shared/dates';
import { pluralize } from '../../shared/requirements';
import {
  APPLICATION_STATUS_LABELS,
  CAMPAIGN_STATUS_LABELS,
  PLATFORM_LABELS,
  formatDate,
} from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';
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

const CAMPAIGN_STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'];

const APPLICATION_ACTIONS = [
  { status: 'APPROVED', label: 'Одобрить' },
  { status: 'REJECTED', label: 'Отклонить' },
  { status: 'COMPLETED', label: 'Завершить' },
];

const APPLICATION_CHIP = {
  PENDING: ui.chipWarning,
  APPROVED: ui.chipSuccess,
  REJECTED: ui.chipDanger,
  COMPLETED: ui.chipOutline,
};

const CAMPAIGN_CHIP = {
  ACTIVE: ui.chipSuccess,
  PAUSED: ui.chipWarning,
  DRAFT: ui.chipOutline,
  COMPLETED: ui.chipOutline,
};

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

const formatCompactViews = (views) => {
  const n = Number(views) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace('.', ',')} млн`;
  if (n >= 10_000) return `${Math.round(n / 1000)} тыс.`;
  return formatViews(n);
};

const isPublished = (application) =>
  application.status === 'APPROVED' || application.status === 'COMPLETED';

const CampaignEditor = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
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
  const [expandedId, setExpandedId] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [materialProgress, setMaterialProgress] = useState(null);
  const [link, setLink] = useState({ url: '', title: '' });
  const [linkError, setLinkError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [wallet, setWallet] = useState(null);
  const ownsWallet = apiClient.getJwtMetadata()?.role === 'CUSTOMER';
  const customerName = apiClient.getJwtMetadata()?.name || '';

  const loadWallet = useCallback(async () => {
    try {
      const res = await apiClient.api.myWallet();
      setWallet(res.data);
    } catch {
      setWallet(null);
    }
  }, []);

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
          err?.response?.data?.message || err?.message || 'Не удалось загрузить кампанию'
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
      toast.error('Файл не больше 100 МБ. Большие материалы приложите ссылкой.');
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
      toast.success('Файл загружен. Не забудьте сохранить кампанию');
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

  const setViewRegion = (region) => {
    setForm((prev) => ({ ...prev, viewRegion: region }));
    clearFieldError(setErrors, 'viewRegion');
    setError('');
  };

  const blindPlatforms = platformsWithoutGeography(form.platforms);
  const regionBlindWarning = form.viewRegion !== 'WORLD' && blindPlatforms.length > 0;

  const invalid = (name) => (errors[name] ? 'true' : undefined);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      toast.error('Обложка — JPEG, PNG, WebP или GIF.');
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      toast.error('Обложка не больше 10 МБ.');
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
      toast.success('Обложка загружена. Не забудьте сохранить кампанию');
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Не удалось загрузить обложку'
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

  const submit = async (statusOverride) => {
    const status = statusOverride || form.status;
    const title = form.title.trim();
    const description = form.description.trim();
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
      title: validateRequired(title, 'Укажите название'),
      description: validateRequired(description, 'Опишите задачу для креатора'),
      photoKey: form.photoKey ? '' : 'Загрузите обложку',
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
    if (hasErrors(nextErrors)) {
      setError('Проверьте выделенные поля');
      return;
    }

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
          status,
        });
        toast.success(status === 'ACTIVE' ? 'Кампания запущена' : 'Черновик сохранён');
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
      if (status && status !== saved.status) {
        const patched = await apiClient.api.updateCampaignStatus(campaignId, { status });
        saved = patched.data;
      }
      setCampaign(saved);
      const savedFields = formFromCampaign(saved);
      setForm(savedFields);
      setSavedForm(savedFields);
      setPhotoPreview(saved.photoUrl || '');
      loadWallet();
      toast.success('Кампания сохранена');
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Не удалось сохранить кампанию'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Удалить кампанию «${campaign?.title || form.title}»?`)) return;
    setDeleting(true);
    try {
      await apiClient.api.deleteCampaign(campaignId);
      toast.success('Кампания удалена');
      navigate('/app/campaigns', { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Не удалось удалить кампанию'
      );
      setDeleting(false);
    }
  };

  const handleApplicationStatus = async (application, status) => {
    setBusyApplicationId(application.id);
    try {
      await apiClient.api.updateApplicationStatus(application.id, { status });
      toast.success(`Отклик: ${APPLICATION_STATUS_LABELS[status] || status}`);
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
      <div className={ui.page}>
        <p className={ui.message}>Загрузка кампании…</p>
      </div>
    );
  }

  if (pageError && !campaign) {
    return (
      <div className={ui.page}>
        <Link to="/app/campaigns" className={ui.backLink}>
          <Icon name="arrowLeft" size={16} /> Мои кампании
        </Link>
        <p className={ui.errorBanner}>{pageError}</p>
      </div>
    );
  }

  const busy = saving || uploadProgress !== null || materialProgress !== null;
  const rateKopecks = rubToKopecks(form.rateRub) || 0;
  const budgetKopecks = rubToKopecks(form.budgetRub) || 0;
  const reachViews = rateKopecks > 0 ? Math.floor((budgetKopecks / rateKopecks) * 1000) : 0;
  const previewTitle = form.title.trim() || 'Название кампании';
  const previewPlatforms = form.platforms.map((p) => PLATFORM_LABELS[p] || p).join(', ');

  const totalViews = campaign?.totalViews ?? 0;
  const published = applications.filter(isPublished);
  const creators = new Set(published.map((row) => row.creatorId)).size;
  const cpv = totalViews > 0 ? spentKopecks / totalViews : 0;
  const budgetPercent =
    savedBudgetKopecks > 0 ? Math.min(100, Math.round((spentKopecks / savedBudgetKopecks) * 100)) : 0;
  const funnel = [
    { label: 'Отклики', value: applications.length },
    { label: 'Одобрено', value: published.length },
    { label: 'Набрали просмотры', value: published.filter((row) => (row.views ?? 0) > 0).length },
    { label: 'Завершено', value: applications.filter((row) => row.status === 'COMPLETED').length },
  ];
  const funnelMax = applications.length || 1;

  return (
    <div className={ui.page}>
      <Link to="/app/campaigns" className={ui.backLink}>
        <Icon name="arrowLeft" size={16} /> Мои кампании
      </Link>

      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Рекламодатель</span>
          <h1 className={ui.title}>{isNew ? 'Новая кампания' : campaign.title}</h1>
          {isNew ? (
            <p className={ui.subtitle}>Задайте условия — креаторы предложат свои идеи.</p>
          ) : (
            <p className={styles.crumbs}>
              <span className={CAMPAIGN_CHIP[campaign.status] || ui.chipOutline}>
                {campaign.statusDescription || CAMPAIGN_STATUS_LABELS[campaign.status] || campaign.status}
              </span>
              <span>создана {formatDate(campaign.createdAt)}</span>
              {campaign.publicId && campaign.status === 'ACTIVE' && (
                <Link to={`/campaigns/${campaign.publicId}`} className={ui.linkAccent}>
                  Как видят креаторы →
                </Link>
              )}
            </p>
          )}
        </div>
        {!isNew && (
          <div className={ui.pageHeadActions}>
            <button
              type="button"
              className={ui.btnDanger}
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? 'Удаление…' : 'Удалить'}
            </button>
            <a href="#campaign-form" className={ui.btnSecondary}>
              Настройки кампании
            </a>
          </div>
        )}
      </header>

      {!isNew && (
        <>
          <div className={ui.grid4}>
            <div className={ui.stat}>
              <span className={ui.statLabel}>Подтверждённые просмотры</span>
              <span className={ui.statValue}>{formatCompactViews(totalViews)}</span>
              <span className={ui.statNote}>{formatViews(totalViews)} всего</span>
            </div>
            <div className={ui.stat}>
              <span className={ui.statLabel}>Потрачено</span>
              <span className={ui.statValue}>{formatRubles(spentKopecks)}</span>
              <span className={ui.statNote}>{budgetPercent}% бюджета</span>
            </div>
            <div className={ui.stat}>
              <span className={ui.statLabel}>Роликов в работе</span>
              <span className={ui.statValue}>{applicationsLoading ? '…' : published.length}</span>
              <span className={`${ui.statNote} ${creators ? ui.statUp : ''}`}>
                {applicationsLoading ? '' : `${creators} ${pluralize(creators, ['креатор', 'креатора', 'креаторов'])}`}
              </span>
            </div>
            <div className={ui.stat}>
              <span className={ui.statLabel}>Средняя цена просмотра</span>
              <span className={ui.statValue}>{cpv > 0 ? formatRubles(Math.round(cpv)) : '—'}</span>
              <span className={ui.statNote}>
                ставка {formatRubles(campaign.ratePerThousandKopecks)} / 1 000
              </span>
            </div>
          </div>

          <div className={styles.analytics}>
            <section className={ui.card}>
              <h2 className={ui.cardTitle}>Бюджет кампании</h2>
              <p className={styles.bigMoney}>{formatRubles(campaign.remainingKopecks ?? 0)}</p>
              <p className={styles.bigMoneyNote}>Осталось на просмотры</p>
              <BudgetBar budgetKopecks={campaign.budgetKopecks} spentKopecks={campaign.spentKopecks} />
              <p className={styles.bigMoneyNote}>
                Регион просмотров: {viewRegionLabel(campaign.viewRegion || DEFAULT_VIEW_REGION)}
                {campaign.endsAt ? ` · приём до ${formatDay(campaign.endsAt)}` : ''}
              </p>
            </section>
            <section className={ui.card}>
              <h2 className={ui.cardTitle}>Воронка кампании</h2>
              <ul className={styles.funnel}>
                {funnel.map((row) => (
                  <li key={row.label} className={styles.funnelRow}>
                    <div className={styles.funnelHead}>
                      <span className={styles.funnelLabel}>{row.label}</span>
                      <span className={styles.funnelValue}>{applicationsLoading ? '…' : row.value}</span>
                      <span className={styles.funnelPercent}>
                        {applicationsLoading ? '' : `${Math.round((row.value / funnelMax) * 100)}%`}
                      </span>
                    </div>
                    <div className={ui.track} aria-hidden="true">
                      <div
                        className={ui.fill}
                        style={{ width: `${applicationsLoading ? 0 : (row.value / funnelMax) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className={ui.sectionHead}>
            <h2 className={ui.sectionTitle}>Отклики креаторов</h2>
            <button
              type="button"
              className={`${ui.btnSecondary} ${ui.btnSmall}`}
              onClick={loadApplications}
              disabled={applicationsLoading}
            >
              <Icon name="refresh" size={16} /> Обновить
            </button>
          </div>
          <section className={`${ui.card} ${styles.applications}`}>
            {applicationsError && <p className={ui.errorBanner}>{applicationsError}</p>}
            {applicationsLoading ? (
              <p className={ui.message}>Загрузка откликов…</p>
            ) : applications.length === 0 ? (
              <p className={ui.message}>
                Откликов пока нет. Активная кампания видна креаторам в офферах.
              </p>
            ) : (
              <ul className={styles.appList}>
                {applications.map((application) => {
                  const open = expandedId === application.id;
                  return (
                    <li key={application.id} className={styles.appItem}>
                      <div className={styles.appRow}>
                        <div className={styles.appCreator}>
                          <span className={ui.avatar} aria-hidden="true">
                            {(application.creatorName || '·').trim().charAt(0)}
                          </span>
                          <div className={styles.appCreatorText}>
                            <span className={styles.appName}>
                              {application.creatorName} <TrustBadge level={application.creatorTrustLevel} />
                            </span>
                            <span className={styles.appMeta}>
                              {application.platformDescription ||
                                PLATFORM_LABELS[application.platform] ||
                                application.platform}
                              {' · '}
                              {formatDate(application.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.appCell}>
                          <span className={styles.appCellLabel}>Просмотры</span>
                          <span className={styles.appCellValue}>{formatViews(application.views ?? 0)}</span>
                        </div>
                        <div className={styles.appCell}>
                          <span className={styles.appCellLabel}>Начислено</span>
                          <span className={`${styles.appCellValue} ${ui.money}`}>
                            {formatRubles(application.accruedKopecks ?? 0)}
                          </span>
                        </div>
                        <div className={styles.appStatus}>
                          <FraudBadge status={application.fraudStatus} />
                          <span className={APPLICATION_CHIP[application.status] || ui.chipOutline}>
                            {application.statusDescription ||
                              APPLICATION_STATUS_LABELS[application.status] ||
                              application.status}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={`${styles.appToggle} ${open ? styles.appToggleOpen : ''}`}
                          onClick={() => setExpandedId(open ? null : application.id)}
                          aria-expanded={open}
                          aria-label={open ? 'Свернуть отклик' : 'Развернуть отклик'}
                        >
                          <Icon name="chevronDown" size={18} />
                        </button>
                      </div>

                      {open && (
                        <div className={styles.appDetails}>
                          <a
                            className={styles.videoLink}
                            href={application.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Icon name="external" size={16} /> {application.videoUrl}
                          </a>
                          {application.creatorTelegram && (
                            <p className={styles.appMeta}>Telegram: {application.creatorTelegram}</p>
                          )}
                          {application.comment && (
                            <p className={styles.comment}>{application.comment}</p>
                          )}
                          {application.campaignViewRegion && application.campaignViewRegion !== 'WORLD' && (
                            <p className={styles.appMeta}>
                              {application.viewsGeographyKnown === false ? (
                                <span className={ui.hintWarn}>
                                  География недоступна: просмотры в расчёт не идут
                                </span>
                              ) : (
                                <>
                                  В расчёт: <b>{formatViews(application.payableViews ?? 0)}</b> просмотров
                                </>
                              )}
                            </p>
                          )}
                          <CreatorSocials userId={application.creatorId} />
                          {application.fraudStatus === 'SUSPICIOUS' && (
                            <p className={ui.hintWarn}>
                              Антифрод заметил признаки накрутки: деньги креатору заморожены до решения
                              платформы. Вы можете отклонить отклик сами.
                            </p>
                          )}
                          {application.fraudStatus === 'FRAUD' && (
                            <p className={ui.hintWarn}>
                              Накрутка: начисление по ролику обнулено, бюджет не тратится.
                            </p>
                          )}
                          <FraudFlags flags={application.fraudFlags} />
                          <div className={styles.appActions}>
                            {APPLICATION_ACTIONS.filter(
                              (action) => action.status !== application.status
                            ).map((action) => (
                              <button
                                key={action.status}
                                type="button"
                                className={`${
                                  action.status === 'REJECTED'
                                    ? ui.btnDanger
                                    : action.status === 'APPROVED'
                                      ? ui.btnPrimary
                                      : ui.btnSecondary
                                } ${ui.btnSmall}`}
                                onClick={() => handleApplicationStatus(application, action.status)}
                                disabled={busyApplicationId === application.id}
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className={ui.sectionHead} id="campaign-form">
            <h2 className={ui.sectionTitle}>Настройки кампании</h2>
          </div>
        </>
      )}

      <form className={styles.editor} onSubmit={handleSubmit} noValidate>
        <div className={styles.formColumn}>
          <section className={ui.card}>
            <h2 className={styles.formTitle}>Расскажите о задаче</h2>

            <div className={styles.field}>
              <label className={ui.label} htmlFor="campaign-title">
                Название кампании
              </label>
              <input
                id="campaign-title"
                type="text"
                name="title"
                value={form.title}
                onChange={setField}
                className={ui.input}
                aria-invalid={invalid('title')}
                maxLength={255}
                autoComplete="off"
                placeholder="Например, «Город в твоём ритме»"
              />
              <FieldError>{errors.title}</FieldError>
            </div>

            <div className={styles.field}>
              <label className={ui.label} htmlFor="campaign-description">
                Описание и требования
              </label>
              <textarea
                id="campaign-description"
                name="description"
                value={form.description}
                onChange={setField}
                className={ui.textarea}
                aria-invalid={invalid('description')}
                rows={6}
                placeholder="Опишите результат и обязательные детали. Оставьте креатору пространство для идеи."
              />
              <FieldError>{errors.description}</FieldError>
            </div>

            <div className={styles.field}>
              <span className={ui.label}>Обложка</span>
              <div className={styles.photoRow}>
                <div className={styles.photoPreview}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Обложка кампании" />
                  ) : (
                    <span className={styles.photoEmpty}>Нет обложки</span>
                  )}
                </div>
                <div className={styles.photoControls}>
                  <label
                    className={`${ui.btnSecondary} ${styles.fileBtn} ${
                      uploadProgress !== null ? styles.fileBtnBusy : ''
                    }`}
                  >
                    <Icon name="plus" size={16} />
                    {uploadProgress !== null
                      ? `Загрузка ${uploadProgress}%`
                      : photoPreview
                        ? 'Заменить обложку'
                        : 'Загрузить обложку'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handlePhotoChange}
                      className={styles.fileInput}
                      disabled={uploadProgress !== null}
                    />
                  </label>
                  <span className={ui.hint}>JPEG, PNG, WebP или GIF до 10 МБ.</span>
                  <FieldError>{errors.photoKey}</FieldError>
                </div>
              </div>
            </div>

            <div className={styles.field}>
              <span className={ui.label}>Площадки</span>
              <div className={ui.chips} role="group" aria-label="Площадки">
                {VIDEO_PLATFORMS.map((platform) => {
                  const selected = form.platforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      className={selected ? ui.chipActive : ui.chip}
                      onClick={() => togglePlatform(platform)}
                      aria-pressed={selected}
                    >
                      {selected ? <Icon name="check" size={14} /> : <SocialIcon name={platform} className={styles.chipIcon} />}
                      {PLATFORM_LABELS[platform]}
                    </button>
                  );
                })}
              </div>
              <FieldError>{errors.platforms}</FieldError>
              <span className={ui.hint}>
                Креатор сможет подать ролик только с выбранных площадок.
              </span>
            </div>

            <div className={styles.field}>
              <span className={ui.label}>Регион просмотров</span>
              <div className={ui.chips} role="radiogroup" aria-label="Регион просмотров">
                {VIEW_REGIONS.map((region) => {
                  const selected = form.viewRegion === region;
                  return (
                    <button
                      key={region}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={selected ? ui.chipActive : ui.chip}
                      onClick={() => setViewRegion(region)}
                    >
                      {viewRegionLabel(region)}
                    </button>
                  );
                })}
              </div>
              <FieldError>{errors.viewRegion}</FieldError>
              <span className={ui.hint}>
                Оплачиваются только просмотры из выбранного региона; «весь мир» — все просмотры.
              </span>
              {regionBlindWarning && (
                <span className={ui.hintWarn}>
                  {platformLabels(blindPlatforms)} географию просмотров{' '}
                  {blindPlatforms.length > 1 ? 'не отдают' : 'не отдаёт'}: ролики оттуда по такому
                  региону не оплатятся. Географию отдаёт только YouTube с доступом к аналитике.
                </span>
              )}
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={ui.label} htmlFor="campaign-rate">
                  Ставка за 1 000 просмотров
                </label>
                <div className={styles.money}>
                  <input
                    id="campaign-rate"
                    type="text"
                    inputMode="decimal"
                    name="rateRub"
                    value={form.rateRub}
                    onChange={setMoneyField}
                    className={ui.input}
                    aria-invalid={invalid('rateRub')}
                    autoComplete="off"
                  />
                  <span className={styles.moneyUnit}>₽</span>
                </div>
                <FieldError>{errors.rateRub}</FieldError>
              </div>
              <div className={styles.field}>
                <label className={ui.label} htmlFor="campaign-budget">
                  Общий бюджет
                </label>
                <div className={styles.money}>
                  <input
                    id="campaign-budget"
                    type="text"
                    inputMode="decimal"
                    name="budgetRub"
                    value={form.budgetRub}
                    onChange={setMoneyField}
                    className={ui.input}
                    aria-invalid={invalid('budgetRub')}
                    autoComplete="off"
                  />
                  <span className={styles.moneyUnit}>₽</span>
                </div>
                <FieldError>{errors.budgetRub}</FieldError>
                <span className={ui.hint}>
                  Резервируется из кошелька.
                  {availableKopecks != null && (
                    <>
                      {' '}
                      Доступно {formatRubles(availableKopecks)}
                      {!isNew && savedBudgetKopecks > 0
                        ? ` (из них ${formatRubles(savedBudgetKopecks)} уже в этой кампании)`
                        : ''}
                      .
                    </>
                  )}{' '}
                  <Link to="/app/wallet" className={ui.linkAccent}>
                    Финансы
                  </Link>
                </span>
              </div>
              <div className={styles.field}>
                <label className={ui.label} htmlFor="campaign-min-payout">
                  Порог вывода для креатора
                </label>
                <div className={styles.money}>
                  <input
                    id="campaign-min-payout"
                    type="text"
                    inputMode="decimal"
                    name="minPayoutRub"
                    value={form.minPayoutRub}
                    onChange={setMoneyField}
                    className={ui.input}
                    aria-invalid={invalid('minPayoutRub')}
                    autoComplete="off"
                  />
                  <span className={styles.moneyUnit}>₽</span>
                </div>
                <FieldError>{errors.minPayoutRub}</FieldError>
                <span className={ui.hint}>
                  Заработанное по кампании уходит в кошелёк креатора, когда накопится эта сумма.
                </span>
              </div>
              <div className={styles.field}>
                <label className={ui.label} htmlFor="campaign-ends">
                  Приём работ до
                </label>
                <input
                  id="campaign-ends"
                  type="date"
                  name="endsOn"
                  value={form.endsOn}
                  onChange={setField}
                  min={form.startsOn || undefined}
                  className={ui.input}
                  aria-invalid={invalid('endsOn')}
                />
                <FieldError>{errors.endsOn}</FieldError>
                <span className={ui.hint}>По Москве, включительно. Пусто — без ограничения.</span>
              </div>
            </div>

            <details className={styles.extra} open={!isNew}>
              <summary className={styles.extraSummary}>
                <span>Дополнительно</span>
                <span className={styles.extraNote}>старт приёма, пороги, лимит роликов</span>
              </summary>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={ui.label} htmlFor="campaign-starts">
                    Приём работ с
                  </label>
                  <input
                    id="campaign-starts"
                    type="date"
                    name="startsOn"
                    value={form.startsOn}
                    onChange={setField}
                    className={ui.input}
                    aria-invalid={invalid('startsOn')}
                  />
                  <FieldError>{errors.startsOn}</FieldError>
                </div>
                <div className={styles.field}>
                  <label className={ui.label} htmlFor="campaign-length">
                    Длина ролика от, сек
                  </label>
                  <input
                    id="campaign-length"
                    type="text"
                    inputMode="numeric"
                    name="minVideoSeconds"
                    value={form.minVideoSeconds}
                    onChange={setIntField}
                    className={ui.input}
                    aria-invalid={invalid('minVideoSeconds')}
                    autoComplete="off"
                  />
                  <FieldError>{errors.minVideoSeconds}</FieldError>
                  <span className={ui.hint}>Проверяете вручную.</span>
                </div>
                <div className={styles.field}>
                  <label className={ui.label} htmlFor="campaign-min-views">
                    Оплата от, просмотров
                  </label>
                  <input
                    id="campaign-min-views"
                    type="text"
                    inputMode="numeric"
                    name="minPaidViews"
                    value={form.minPaidViews}
                    onChange={setIntField}
                    className={ui.input}
                    aria-invalid={invalid('minPaidViews')}
                    autoComplete="off"
                  />
                  <FieldError>{errors.minPaidViews}</FieldError>
                  <span className={ui.hint}>Ниже порога ролик не оплачивается.</span>
                </div>
                <div className={styles.field}>
                  <label className={ui.label} htmlFor="campaign-max-videos">
                    Роликов от одного креатора
                  </label>
                  <input
                    id="campaign-max-videos"
                    type="text"
                    inputMode="numeric"
                    name="maxVideosPerCreator"
                    value={form.maxVideosPerCreator}
                    onChange={setIntField}
                    className={ui.input}
                    aria-invalid={invalid('maxVideosPerCreator')}
                    autoComplete="off"
                  />
                  <FieldError>{errors.maxVideosPerCreator}</FieldError>
                </div>
              </div>
            </details>

            <div className={ui.divider} />

            <h3 className={styles.materialsTitle}>
              <Icon name="plus" size={22} className={ui.accent} /> Прикрепить бриф и материалы
            </h3>
            <p className={ui.hint}>
              PDF, изображения, архив до 100 МБ или ссылка. Всего до {MATERIALS_MAX} материалов.
            </p>
            <MaterialList
              materials={form.materials}
              onRemove={removeMaterial}
              className={styles.materials}
            />
            <div className={styles.materialAdd}>
              <label
                className={`${ui.btnSecondary} ${styles.fileBtn} ${
                  materialProgress !== null || materialsFull ? styles.fileBtnBusy : ''
                }`}
              >
                <Icon name="file" size={16} />
                {materialProgress !== null ? `Загрузка ${materialProgress}%` : 'Файл'}
                <input
                  type="file"
                  onChange={handleMaterialChange}
                  className={styles.fileInput}
                  disabled={materialProgress !== null || materialsFull}
                />
              </label>
              <input
                type="text"
                name="url"
                value={link.url}
                onChange={setLinkField}
                onKeyDown={addLinkOnEnter}
                className={ui.input}
                aria-invalid={linkError ? 'true' : undefined}
                maxLength={2048}
                autoComplete="off"
                placeholder="Ссылка на материалы"
                disabled={materialsFull}
              />
              <input
                type="text"
                name="title"
                value={link.title}
                onChange={setLinkField}
                onKeyDown={addLinkOnEnter}
                className={ui.input}
                maxLength={255}
                autoComplete="off"
                placeholder="Подпись"
                disabled={materialsFull}
              />
              <button
                type="button"
                className={ui.btnSecondary}
                onClick={handleAddLink}
                disabled={materialsFull}
              >
                Добавить ссылку
              </button>
            </div>
            <FieldError>{linkError}</FieldError>

            {error && <p className={`${ui.errorText} ${styles.formError}`}>{error}</p>}
            {!error && dirty && !isNew && (
              <p className={styles.formNote}>Есть несохранённые изменения</p>
            )}
          </section>

          <div className={styles.actions}>
            {isNew ? (
              <>
                <button
                  type="button"
                  className={`${ui.btnSecondary} ${ui.btnLarge}`}
                  onClick={() => submit('DRAFT')}
                  disabled={busy}
                >
                  {saving ? 'Сохранение…' : 'Сохранить черновик'}
                </button>
                <button
                  type="button"
                  className={`${ui.btnPrimary} ${ui.btnLarge}`}
                  onClick={() => submit('ACTIVE')}
                  disabled={busy}
                >
                  {saving ? 'Запуск…' : 'Запустить кампанию →'}
                </button>
              </>
            ) : (
              <>
                <label className={styles.statusField}>
                  <span className={ui.label}>Статус</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={setField}
                    className={ui.input}
                  >
                    {CAMPAIGN_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {CAMPAIGN_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className={`${ui.btnPrimary} ${ui.btnLarge}`}
                  disabled={busy || !dirty}
                >
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </button>
              </>
            )}
          </div>
        </div>

        <aside className={styles.preview}>
          <section className={ui.card}>
            <h2 className={ui.cardTitle}>Предпросмотр оффера</h2>
            <div className={ui.chips}>
              {form.platforms.length > 0 ? (
                form.platforms.map((platform) => (
                  <span key={platform} className={ui.chipActive}>
                    {PLATFORM_LABELS[platform]}
                  </span>
                ))
              ) : (
                <span className={ui.chipOutline}>Площадки не выбраны</span>
              )}
            </div>
            <p className={styles.previewTitle}>{previewTitle}</p>
            <p className={styles.previewMeta}>
              {customerName || 'Бренд'}
              {previewPlatforms ? ` · ${previewPlatforms}` : ''}
              {form.viewRegion !== 'WORLD' ? ` · ${viewRegionLabel(form.viewRegion)}` : ''}
            </p>
            <p className={styles.previewRate}>
              {rateKopecks > 0 ? formatRubles(rateKopecks) : '— ₽'}{' '}
              <span className={styles.previewRateUnit}>/ 1 000</span>
            </p>
            <div className={ui.divider} />
            <div className={ui.kv}>
              <span className={ui.kvKey}>Бюджет</span>
              <span className={ui.kvValue}>{budgetKopecks > 0 ? formatRubles(budgetKopecks) : '—'}</span>
            </div>
            <div className={ui.kv}>
              <span className={ui.kvKey}>Потенциальный охват</span>
              <span className={ui.kvValue}>
                {reachViews > 0 ? `≈ ${formatCompactViews(reachViews)}` : '—'}
              </span>
            </div>
            <div className={ui.kv}>
              <span className={ui.kvKey}>Порог вывода</span>
              <span className={ui.kvValue}>
                {rubToKopecks(form.minPayoutRub) ? formatRubles(rubToKopecks(form.minPayoutRub)) : '—'}
              </span>
            </div>
            <p className={styles.previewNote}>
              Оценка по ставке, без гарантии объёма. Просмотры считаются по официальным API площадок.
            </p>
          </section>

          {isNew && wallet && (
            <section className={ui.card}>
              <span className={ui.eyebrow}>Кошелёк</span>
              <p className={styles.previewRate}>{formatRubles(wallet.balanceKopecks ?? 0)}</p>
              <p className={styles.previewNote}>
                Свободно для резервирования. В кампаниях уже {formatRubles(wallet.allocatedKopecks ?? 0)}.
              </p>
            </section>
          )}

          <section className={ui.cardHint}>
            <p className={styles.hintTitle}>Хороший бриф — сильный контент</p>
            <p>Опишите результат и обязательные детали. Оставьте креатору пространство для идеи.</p>
          </section>
        </aside>
      </form>
    </div>
  );
};

export default CampaignEditor;

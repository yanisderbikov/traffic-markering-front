import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { errorMessage } from '../../shared/auth';
import { clearFieldError, hasErrors } from '../../shared/validation';
import { formatIntInput, formatRubInput, formatRubles } from '../../shared/money';
import {
  FORM_FIELDS,
  MATERIALS_MAX,
  MATERIAL_MAX_BYTES,
  PHOTO_MAX_BYTES,
  PHOTO_TYPES,
  formFromCampaign,
  formToRequest,
  normalizeLink,
  sameValue,
  suggestedRateInput,
  validateCampaign,
} from './campaignForm';

const useCampaignForm = (initialCampaign) => {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [form, setForm] = useState(() => formFromCampaign(initialCampaign));
  const [savedForm, setSavedForm] = useState(() => formFromCampaign(initialCampaign));
  const [photoPreview, setPhotoPreview] = useState(initialCampaign.photoUrl || '');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [materialProgress, setMaterialProgress] = useState(null);
  const [link, setLink] = useState({ url: '', title: '' });
  const [linkError, setLinkError] = useState('');
  const [wallet, setWallet] = useState(null);
  const [benchmarks, setBenchmarks] = useState(null);
  const ratePrefilled = useRef(false);
  const ownsWallet = apiClient.getJwtMetadata()?.role === 'CUSTOMER';

  const loadWallet = useCallback(async () => {
    try {
      const res = await apiClient.api.myWallet();
      setWallet(res.data);
    } catch {
      setWallet(null);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    apiClient.api
      .campaignBenchmarks()
      .then((res) => setBenchmarks(res.data))
      .catch(() => setBenchmarks(null));
  }, []);

  useEffect(() => {
    if (!photoPreview.startsWith('blob:')) return undefined;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const prefillRate = useCallback(() => {
    if (ratePrefilled.current || !benchmarks) return;
    ratePrefilled.current = true;
    const rateRub = suggestedRateInput(benchmarks.medianRatePerThousandKopecks);
    setForm((prev) => (prev.rateRub ? prev : { ...prev, rateRub }));
  }, [benchmarks]);

  const touch = (name) => {
    clearFieldError(setErrors, name);
    setError('');
  };

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    touch(name);
  };

  const setField = (e) => updateField(e.target.name, e.target.value);
  const setMoneyField = (e) => updateField(e.target.name, formatRubInput(e.target.value));
  const setIntField = (e) => updateField(e.target.name, formatIntInput(e.target.value));

  const togglePlatform = (platform) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((item) => item !== platform)
        : [...prev.platforms, platform],
    }));
    touch('platforms');
  };

  const setViewRegion = (region) => updateField('viewRegion', region);

  const materialsFull = form.materials.length >= MATERIALS_MAX;

  const addMaterial = (material) => {
    setForm((prev) => ({ ...prev, materials: [...prev.materials, material] }));
    touch('materials');
  };

  const removeMaterial = (index) => {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, position) => position !== index),
    }));
    setError('');
  };

  const uploadToStorage = async (presign, file, contentType, onProgress) => {
    const res = await presign({ filename: file.name, contentType });
    const { uploadUrl, key } = res.data;
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': contentType },
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return key;
  };

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
      const key = await uploadToStorage(
        apiClient.api.presignCampaignPhoto,
        file,
        file.type,
        setUploadProgress
      );
      updateField('photoKey', key);
      setPhotoPreview(URL.createObjectURL(file));
      toast.success('Обложка загружена');
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось загрузить обложку'));
    } finally {
      setUploadProgress(null);
    }
  };

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
      const key = await uploadToStorage(
        apiClient.api.presignCampaignMaterial,
        file,
        contentType,
        setMaterialProgress
      );
      addMaterial({
        kind: 'FILE',
        title: file.name.slice(0, 255),
        url: '',
        fileKey: key,
        contentType,
        sizeBytes: file.size,
        opensInBrowser: false,
      });
      toast.success('Файл загружен');
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось загрузить файл'));
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

  const dirty = FORM_FIELDS.some((key) => !sameValue(form[key], savedForm[key]));

  const savedBudgetKopecks = campaign.budgetKopecks ?? 0;
  const spentKopecks = campaign.spentKopecks ?? 0;
  const availableKopecks = wallet ? (wallet.balanceKopecks ?? 0) + savedBudgetKopecks : null;

  const budgetError = (budgetKopecks) => {
    if (budgetKopecks < spentKopecks) {
      return `Нельзя опустить ниже уже начисленного: ${formatRubles(spentKopecks)}`;
    }
    if (ownsWallet && availableKopecks != null && budgetKopecks > availableKopecks) {
      return `Не хватает средств в кошельке: доступно ${formatRubles(availableKopecks)}`;
    }
    return '';
  };

  const applySaved = (saved) => {
    const filled = formFromCampaign(saved);
    setCampaign(saved);
    setForm(filled);
    setSavedForm(filled);
    setPhotoPreview(saved.photoUrl || '');
    setSavedAt(new Date());
  };

  const persist = async (nextForm, status) => {
    const changed = FORM_FIELDS.some((key) => !sameValue(nextForm[key], savedForm[key]));
    const changesStatus = Boolean(status) && status !== campaign.status;
    if (!changed && !changesStatus) {
      setError('');
      return campaign;
    }

    setSaving(true);
    setError('');
    try {
      let saved = campaign;
      if (changed) {
        const res = await apiClient.api.updateCampaign(campaign.id, formToRequest(nextForm));
        saved = res.data;
      }
      if (changesStatus) {
        const res = await apiClient.api.updateCampaignStatus(campaign.id, { status });
        saved = res.data;
      }
      applySaved(saved);
      if (changed) loadWallet();
      return saved;
    } catch (err) {
      setError(errorMessage(err, 'Не удалось сохранить кампанию'));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const save = async ({ fields = FORM_FIELDS, requireFilled = false, status } = {}) => {
    const nextErrors = validateCampaign(form, fields, { requireFilled, budgetError });
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    if (hasErrors(nextErrors)) {
      setError('Проверьте выделенные поля');
      return null;
    }
    return persist(form, status);
  };

  const saveValidFields = async () => {
    const fieldErrors = validateCampaign(form, FORM_FIELDS, { requireFilled: false, budgetError });
    const skippedFields = FORM_FIELDS.filter((field) => fieldErrors[field]);
    const validForm = Object.fromEntries(
      FORM_FIELDS.map((field) => [field, skippedFields.includes(field) ? savedForm[field] : form[field]])
    );
    const saved = await persist(validForm);
    return saved && { saved, skippedFields };
  };

  const busy = saving || uploadProgress !== null || materialProgress !== null;

  return {
    campaign,
    form,
    errors,
    error,
    dirty,
    busy,
    saving,
    savedAt,
    photoPreview,
    uploadProgress,
    materialProgress,
    materialsFull,
    link,
    linkError,
    wallet,
    benchmarks,
    availableKopecks,
    savedBudgetKopecks,
    setField,
    setMoneyField,
    setIntField,
    togglePlatform,
    setViewRegion,
    prefillRate,
    removeMaterial,
    handlePhotoChange,
    handleMaterialChange,
    handleAddLink,
    setLinkField,
    addLinkOnEnter,
    save,
    saveValidFields,
  };
};

export default useCampaignForm;

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import Skeleton, { SkeletonPageHead } from '../shared/Skeleton/Skeleton';
import { formatDate } from '../../shared/dictionaries';
import {
  clearFieldError,
  hasErrors,
  validateTelegram,
  validateWebsite,
} from '../../shared/validation';
import ui from '../../shared/ui.module.css';
import styles from './CustomerProfile.module.css';

const emptyForm = {
  company: '',
  about: '',
  telegram: '',
  website: '',
};

const orNull = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? null : trimmed;
};

const formFromProfile = (profile) => ({
  company: profile.company || '',
  about: profile.about || '',
  telegram: profile.telegram || '',
  website: profile.website || '',
});

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [savedForm, setSavedForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const loadProfile = useCallback(async () => {
    try {
      const res = await apiClient.api.getCustomerProfile();
      setProfile(res.data);
      const filled = formFromProfile(res.data);
      setForm(filled);
      setSavedForm(filled);
      setPageError('');
    } catch (err) {
      setPageError(
        err?.response?.data?.message || err?.message || 'Не удалось загрузить профиль'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const setField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(setErrors, name);
    setError('');
  };

  const invalid = (name) => (errors[name] ? 'true' : undefined);

  const dirty = Object.keys(form).some((key) => form[key] !== savedForm[key]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {
      telegram: validateTelegram(form.telegram),
      website: validateWebsite(form.website),
    };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    setError('');
    try {
      const res = await apiClient.api.updateCustomerProfile({
        company: orNull(form.company),
        about: orNull(form.about),
        telegram: orNull(form.telegram),
        website: orNull(form.website),
      });
      setProfile(res.data);
      const savedFields = formFromProfile(res.data);
      setForm(savedFields);
      setSavedForm(savedFields);
      toast.success('Профиль сохранён');
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Не удалось сохранить профиль'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={ui.page} aria-busy="true">
        <SkeletonPageHead eyebrow="Рекламодатель" title="Профиль рекламодателя" />
        <div className={`${ui.card} ${styles.card}`}>
          <div className={styles.formGrid}>
            <Skeleton className={styles.wide} block height={48} radius="var(--field-radius)" />
            <Skeleton className={styles.wide} block height={138} radius="var(--field-radius)" />
            {Array.from({ length: 2 }, (_, index) => (
              <Skeleton key={index} block height={48} radius="var(--field-radius)" />
            ))}
          </div>
          <div className={styles.formActions}>
            <Skeleton width="8rem" height={44} radius="var(--button-radius)" />
          </div>
        </div>
      </div>
    );
  }

  if (pageError && !profile) {
    return (
      <div className={ui.page}>
        <p className={ui.errorBanner}>{pageError}</p>
      </div>
    );
  }

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Рекламодатель</span>
          <h1 className={ui.title}>Профиль рекламодателя</h1>
          <p className={ui.subtitle}>
            Имя учётной записи: {profile?.name || '—'}
            {profile?.updatedAt ? ` · обновлён ${formatDate(profile.updatedAt)}` : ''}
          </p>
        </div>
      </header>

      <form className={`${ui.card} ${styles.card}`} onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          <Field label="Компания" className={styles.wide}>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={setField}
              className={ui.input}
              autoComplete="off"
            />
          </Field>
          <Field label="О компании" className={styles.wide}>
            <textarea
              name="about"
              value={form.about}
              onChange={setField}
              className={ui.textarea}
              rows={5}
            />
          </Field>
          <Field label="Telegram">
            <input
              type="text"
              name="telegram"
              value={form.telegram}
              onChange={setField}
              className={ui.input}
              aria-invalid={invalid('telegram')}
              autoComplete="off"
            />
            <FieldError>{errors.telegram}</FieldError>
          </Field>
          <Field label="Сайт">
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={setField}
              className={ui.input}
              aria-invalid={invalid('website')}
              autoComplete="off"
            />
            <FieldError>{errors.website}</FieldError>
          </Field>
        </div>

        <p className={`${ui.hint} ${styles.note}`}>
          Название компании показывается на карточке каждой вашей кампании — креаторы по нему
          понимают, с кем работают.
        </p>

        {error && <p className={`${ui.errorText} ${styles.formError}`}>{error}</p>}

        <div className={styles.formActions}>
          <button type="submit" className={ui.btnPrimary} disabled={saving || !dirty}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfile;

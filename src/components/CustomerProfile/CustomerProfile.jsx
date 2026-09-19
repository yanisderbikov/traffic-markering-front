import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import { formatDate } from '../../shared/dictionaries';
import {
  clearFieldError,
  hasErrors,
  validateTelegram,
  validateWebsite,
} from '../../shared/validation';
import styles from './CustomerProfile.module.css';

const emptyForm = {
  company: '',
  about: '',
  telegram: '',
  website: '',
};

// Пустое поле — это «не указано», а не пустая строка: иначе на карточке объявления
// вместо названия компании будет пустое место.
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
      <div className={styles.wrap}>
        <p className={styles.message}>Загрузка профиля…</p>
      </div>
    );
  }

  if (pageError && !profile) {
    return (
      <div className={styles.wrap}>
        <p className={styles.banner}>{pageError}</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Профиль заказчика</h1>
      <p className={styles.subtitle}>
        Имя учётной записи: {profile?.name || '—'}
        {profile?.updatedAt ? ` · обновлён ${formatDate(profile.updatedAt)}` : ''}
      </p>

      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          <Field label="Компания" className={styles.labelWide}>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={setField}
              className={styles.input}
              autoComplete="off"
            />
          </Field>
          <Field label="О компании" className={styles.labelWide}>
            <textarea
              name="about"
              value={form.about}
              onChange={setField}
              className={styles.textarea}
              rows={5}
            />
          </Field>
          <Field label="Telegram">
            <input
              type="text"
              name="telegram"
              value={form.telegram}
              onChange={setField}
              className={styles.input}
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
              className={styles.input}
              aria-invalid={invalid('website')}
              autoComplete="off"
            />
            <FieldError>{errors.website}</FieldError>
          </Field>
        </div>

        <p className={styles.hint}>
          Название компании показывается на карточке каждого вашего объявления —
          криаторы по нему понимают, с кем работают.
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.submit} ${dirty ? '' : styles.submitIdle}`}
            disabled={saving || !dirty}
          >
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerProfile;

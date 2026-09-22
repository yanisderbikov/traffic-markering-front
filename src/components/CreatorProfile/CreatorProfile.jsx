import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import { formatDate } from '../../shared/dictionaries';
import { clearFieldError, hasErrors, validateTelegram } from '../../shared/validation';
import styles from './CreatorProfile.module.css';

const emptyForm = {
  displayName: '',
  bio: '',
  telegram: '',
  instagram: '',
  tiktok: '',
  youtubeShorts: '',
};

// Пустое поле — это «не указано», а не пустая строка: иначе в профиле заказчика
// появятся пустые контакты вместо прочерков.
const orNull = (value) => {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? null : trimmed;
};

const formFromProfile = (profile) => ({
  displayName: profile.displayName || '',
  bio: profile.bio || '',
  telegram: profile.telegram || '',
  instagram: profile.instagram || '',
  tiktok: profile.tiktok || '',
  youtubeShorts: profile.youtubeShorts || '',
});

const CreatorProfile = () => {
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
      const res = await apiClient.api.getCreatorProfile();
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

  const dirty = Object.keys(form).some((key) => form[key] !== savedForm[key]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = { telegram: validateTelegram(form.telegram) };
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSaving(true);
    setError('');
    try {
      const res = await apiClient.api.updateCreatorProfile({
        displayName: orNull(form.displayName),
        bio: orNull(form.bio),
        telegram: orNull(form.telegram),
        instagram: orNull(form.instagram),
        tiktok: orNull(form.tiktok),
        youtubeShorts: orNull(form.youtubeShorts),
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
      <h1 className={styles.title}>Профиль креатора</h1>
      <p className={styles.subtitle}>
        Имя учётной записи: {profile?.name || '—'}
        {profile?.updatedAt ? ` · обновлён ${formatDate(profile.updatedAt)}` : ''}
      </p>

      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          <Field label="Отображаемое имя" className={styles.labelWide}>
            <input
              type="text"
              name="displayName"
              value={form.displayName}
              onChange={setField}
              className={styles.input}
              autoComplete="off"
            />
          </Field>
          <Field label="О себе" className={styles.labelWide}>
            <textarea
              name="bio"
              value={form.bio}
              onChange={setField}
              className={styles.textarea}
              rows={5}
            />
          </Field>
          <Field
            label={
              <span className={styles.labelText}>
                <SocialIcon name="telegram" />
                Telegram
              </span>
            }
          >
            <input
              type="text"
              name="telegram"
              value={form.telegram}
              onChange={setField}
              className={styles.input}
              aria-invalid={errors.telegram ? 'true' : undefined}
              autoComplete="off"
            />
            <FieldError>{errors.telegram}</FieldError>
          </Field>
          <Field
            label={
              <span className={styles.labelText}>
                <SocialIcon name="instagram" />
                Instagram
              </span>
            }
          >
            <input
              type="text"
              name="instagram"
              value={form.instagram}
              onChange={setField}
              className={styles.input}
              autoComplete="off"
            />
          </Field>
          <Field
            label={
              <span className={styles.labelText}>
                <SocialIcon name="tiktok" />
                TikTok
              </span>
            }
          >
            <input
              type="text"
              name="tiktok"
              value={form.tiktok}
              onChange={setField}
              className={styles.input}
              autoComplete="off"
            />
          </Field>
          <Field
            label={
              <span className={styles.labelText}>
                <SocialIcon name="youtube" />
                YouTube Shorts
              </span>
            }
          >
            <input
              type="text"
              name="youtubeShorts"
              value={form.youtubeShorts}
              onChange={setField}
              className={styles.input}
              autoComplete="off"
            />
          </Field>
        </div>

        <p className={styles.hint}>
          Соцсети и Telegram видит заказчик, когда вы откликаетесь на его объявление, —
          по ним он свяжется с вами.
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

export default CreatorProfile;

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import SocialIcon from '../shared/SocialIcon/SocialIcon';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import Skeleton, { SkeletonPageHead } from '../shared/Skeleton/Skeleton';
import { formatDate } from '../../shared/dictionaries';
import { clearFieldError, hasErrors, validateTelegram } from '../../shared/validation';
import ui from '../../shared/ui.module.css';
import styles from './CreatorProfile.module.css';

const emptyForm = {
  displayName: '',
  bio: '',
  telegram: '',
  instagram: '',
  tiktok: '',
  youtubeShorts: '',
};

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

const SocialLabel = ({ name, children }) => (
  <span className={styles.labelText}>
    <SocialIcon name={name} />
    {children}
  </span>
);

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
      <div className={ui.page} aria-busy="true">
        <SkeletonPageHead eyebrow="Креатор" title="Профиль креатора" />
        <div className={`${ui.card} ${styles.card}`}>
          <div className={styles.formGrid}>
            <Skeleton className={styles.wide} block height={48} radius="var(--field-radius)" />
            <Skeleton className={styles.wide} block height={138} radius="var(--field-radius)" />
            {Array.from({ length: 4 }, (_, index) => (
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
          <span className={ui.eyebrow}>Креатор</span>
          <h1 className={ui.title}>Профиль креатора</h1>
          <p className={ui.subtitle}>
            Имя учётной записи: {profile?.name || '—'}
            {profile?.updatedAt ? ` · обновлён ${formatDate(profile.updatedAt)}` : ''}
          </p>
        </div>
      </header>

      <form className={`${ui.card} ${styles.card}`} onSubmit={handleSubmit} noValidate>
        <div className={styles.formGrid}>
          <Field label="Отображаемое имя" className={styles.wide}>
            <input
              type="text"
              name="displayName"
              value={form.displayName}
              onChange={setField}
              className={ui.input}
              autoComplete="off"
            />
          </Field>
          <Field label="О себе" className={styles.wide}>
            <textarea
              name="bio"
              value={form.bio}
              onChange={setField}
              className={ui.textarea}
              rows={5}
            />
          </Field>
          <Field label={<SocialLabel name="telegram">Telegram</SocialLabel>}>
            <input
              type="text"
              name="telegram"
              value={form.telegram}
              onChange={setField}
              className={ui.input}
              aria-invalid={errors.telegram ? 'true' : undefined}
              autoComplete="off"
            />
            <FieldError>{errors.telegram}</FieldError>
          </Field>
          <Field label={<SocialLabel name="instagram">Instagram</SocialLabel>}>
            <input
              type="text"
              name="instagram"
              value={form.instagram}
              onChange={setField}
              className={ui.input}
              autoComplete="off"
            />
          </Field>
          <Field label={<SocialLabel name="tiktok">TikTok</SocialLabel>}>
            <input
              type="text"
              name="tiktok"
              value={form.tiktok}
              onChange={setField}
              className={ui.input}
              autoComplete="off"
            />
          </Field>
          <Field label={<SocialLabel name="youtube">YouTube Shorts</SocialLabel>}>
            <input
              type="text"
              name="youtubeShorts"
              value={form.youtubeShorts}
              onChange={setField}
              className={ui.input}
              autoComplete="off"
            />
          </Field>
        </div>

        <p className={`${ui.hint} ${styles.note}`}>
          Соцсети и Telegram видит рекламодатель, когда вы откликаетесь на его кампанию, — по ним он
          свяжется с вами.
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

export default CreatorProfile;

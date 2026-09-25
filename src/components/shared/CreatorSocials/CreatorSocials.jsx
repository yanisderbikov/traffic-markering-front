import React, { useState } from 'react';
import apiClient from '../../../apiClient';
import SocialIcon from '../SocialIcon/SocialIcon';
import Skeleton from '../Skeleton/Skeleton';
import styles from './CreatorSocials.module.css';

const SOCIAL_FIELDS = [
  { key: 'telegram', label: 'Telegram' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtubeShorts', label: 'YouTube Shorts' },
];

const CreatorSocials = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (profile || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.api.publicCreator(userId);
      setProfile(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const filled = profile
    ? SOCIAL_FIELDS.filter((field) => profile[field.key])
    : [];

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.toggle} onClick={toggle} aria-expanded={open}>
        {open ? 'скрыть соцсети' : 'соцсети креатора'}
      </button>

      {open && (
        <div className={styles.panel}>
          {loading && (
            <ul className={styles.socials} aria-busy="true">
              {SOCIAL_FIELDS.slice(0, 2).map((field) => (
                <li key={field.key} className={styles.social}>
                  <span className={styles.socialLabel}>
                    <Skeleton width="7rem" />
                  </span>
                  <span className={styles.socialValue}>
                    <Skeleton width="10rem" />
                  </span>
                </li>
              ))}
            </ul>
          )}
          {error && <p className={styles.error}>{error}</p>}
          {profile && (
            <>
              {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
              {filled.length === 0 ? (
                <p className={styles.message}>Креатор пока не заполнил соцсети.</p>
              ) : (
                <ul className={styles.socials}>
                  {filled.map((field) => (
                    <li key={field.key} className={styles.social}>
                      <span className={styles.socialLabel}>
                        <SocialIcon name={field.key} className={styles.socialIcon} />
                        {field.label}
                      </span>
                      <span className={styles.socialValue}>{profile[field.key]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatorSocials;

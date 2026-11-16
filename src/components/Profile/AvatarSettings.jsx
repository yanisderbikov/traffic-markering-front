import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { useSession } from '../../shared/session';
import { errorMessage } from '../../shared/auth';
import ui from '../../shared/ui.module.css';
import styles from './AvatarSettings.module.css';

const SOURCE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const SOURCE_MAX_BYTES = 15 * 1024 * 1024;
const AVATAR_SIZE = 512;

/**
 * Аватарка всегда круглая, поэтому до загрузки вырезаем из картинки центральный квадрат
 * и сжимаем до 512 px: в хранилище уходит лёгкий JPEG, а не оригинал с телефона.
 */
const cropToSquare = async (file) => {
  // Старые Safari не принимают опции createImageBitmap — тогда берём картинку как есть.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() =>
    createImageBitmap(file)
  );
  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(side, AVATAR_SIZE);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  // Прозрачный PNG в JPEG стал бы чёрным — подкладываем белый фон.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, size, size);
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size
  );
  bitmap.close?.();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  if (!blob) throw new Error('Не удалось обработать картинку');
  return blob;
};

const AvatarSettings = () => {
  const session = useSession();
  const [busy, setBusy] = useState(false);
  // После загрузки показываем картинку сразу, не дожидаясь перезапроса сессии.
  const [override, setOverride] = useState(undefined);

  const user = session.user;
  const avatarUrl = override !== undefined ? override : user?.avatarUrl;
  const initial = (user?.name || '').trim().charAt(0).toUpperCase() || '·';

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!SOURCE_TYPES.includes(file.type)) {
      toast.error('Подойдёт JPEG, PNG или WebP');
      return;
    }
    if (file.size > SOURCE_MAX_BYTES) {
      toast.error('Картинка не больше 15 МБ');
      return;
    }
    setBusy(true);
    try {
      const blob = await cropToSquare(file);
      const presign = await apiClient.api.presignAvatar({
        filename: 'avatar.jpg',
        contentType: blob.type,
      });
      await axios.put(presign.data.uploadUrl, blob, { headers: { 'Content-Type': blob.type } });
      const saved = await apiClient.api.setAvatar({ key: presign.data.key });
      setOverride(saved.data.avatarUrl || null);
      session.reload();
      toast.success('Аватарка обновлена');
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось загрузить аватарку'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await apiClient.api.removeAvatar();
      setOverride(null);
      session.reload();
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось убрать аватарку'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${ui.page} ${styles.page}`}>
      <div className={`${ui.card} ${styles.card}`}>
        <span className={styles.avatar} aria-hidden="true">
          {avatarUrl ? <img src={avatarUrl} alt="" className={styles.image} /> : initial}
        </span>
        <div className={styles.body}>
          <h2 className={`${ui.cardTitle} ${styles.title}`}>Аватарка</h2>
          <div className={styles.actions}>
            <label
              className={`${ui.btnSecondary} ${ui.btnSmall} ${busy ? styles.disabled : ''}`}
            >
              {busy ? 'Загружаем…' : avatarUrl ? 'Заменить' : 'Загрузить'}
              <input
                type="file"
                accept={SOURCE_TYPES.join(',')}
                onChange={handleFile}
                className={styles.input}
                disabled={busy}
              />
            </label>
            {avatarUrl && (
              <button
                type="button"
                className={`${ui.btnGhost} ${ui.btnSmall}`}
                onClick={remove}
                disabled={busy}
              >
                Убрать
              </button>
            )}
          </div>
          <p className={ui.hint}>JPEG, PNG или WebP. Картинка обрежется по центру до круга.</p>
        </div>
      </div>
    </section>
  );
};

export default AvatarSettings;

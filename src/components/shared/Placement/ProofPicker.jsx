import React, { useId, useState } from 'react';
import toast from 'react-hot-toast';
import { errorMessage } from '../../../shared/auth';
import { proofTypeError, uploadProof } from '../../../shared/placement';
import ui from '../../../shared/ui.module.css';
import styles from './Placement.module.css';

/** Один скриншот или запись экрана: грузится сразу в хранилище, наружу уходит ключ. */
const ProofPicker = ({ value, onChange, label, hint, disabled = false }) => {
  const id = useId();
  const [progress, setProgress] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const error = proofTypeError(file);
    if (error) {
      toast.error(error);
      return;
    }
    setProgress(0);
    try {
      const key = await uploadProof(file, setProgress);
      onChange({ key, name: file.name });
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось загрузить файл'));
    } finally {
      setProgress(null);
    }
  };

  const uploading = progress !== null;
  return (
    <div className={styles.proof}>
      {label && <span className={ui.label}>{label}</span>}
      <div className={styles.proofRow}>
        <input
          id={id}
          type="file"
          className={styles.fileInput}
          accept="image/*,video/mp4,video/quicktime,video/webm"
          onChange={handleFile}
          disabled={disabled || uploading}
        />
        <label
          htmlFor={id}
          className={`${ui.btnSecondary} ${ui.btnSmall}`}
          aria-disabled={disabled || uploading || undefined}
        >
          {uploading ? `Загрузка… ${progress}%` : value ? 'Заменить файл' : 'Загрузить файл'}
        </label>
        {value && <span className={styles.proofName}>{value.name}</span>}
        {value && !uploading && (
          <button type="button" className={ui.linkMuted} onClick={() => onChange(null)} disabled={disabled}>
            Убрать
          </button>
        )}
      </div>
      {hint && <span className={ui.hint}>{hint}</span>}
    </div>
  );
};

export default ProofPicker;

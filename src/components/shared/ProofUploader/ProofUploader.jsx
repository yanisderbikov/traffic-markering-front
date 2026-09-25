import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import apiClient from '../../../apiClient';
import { errorMessage } from '../../../shared/auth';
import styles from './ProofUploader.module.css';

const PROOF_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PROOF_MAX_BYTES = 10 * 1024 * 1024;
const PROOF_MAX_COUNT = 10;

const ProofUploader = ({ proofs, onChange, disabled = false, label = 'Скриншоты перевода *' }) => {
  const [uploading, setUploading] = useState(false);
  const latest = useRef(proofs);
  latest.current = proofs;

  useEffect(
    () => () => {
      latest.current.forEach((proof) => URL.revokeObjectURL(proof.preview));
    },
    []
  );

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (proofs.length + files.length > PROOF_MAX_COUNT) {
      toast.error(`Не больше ${PROOF_MAX_COUNT} скриншотов`);
      return;
    }
    setUploading(true);
    let next = proofs;
    try {
      for (const file of files) {
        if (!PROOF_TYPES.includes(file.type)) {
          toast.error(`${file.name}: только JPEG, PNG, WebP или GIF`);
          continue;
        }
        if (file.size > PROOF_MAX_BYTES) {
          toast.error(`${file.name}: не больше 10 МБ`);
          continue;
        }
        const res = await apiClient.api.presignTransferProof({
          filename: file.name,
          contentType: file.type,
        });
        await axios.put(res.data.uploadUrl, file, { headers: { 'Content-Type': file.type } });
        next = [...next, { key: res.data.key, preview: URL.createObjectURL(file) }];
        onChange(next);
      }
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось загрузить скриншот'));
    } finally {
      setUploading(false);
    }
  };

  const remove = (proof) => {
    URL.revokeObjectURL(proof.preview);
    onChange(proofs.filter((item) => item.key !== proof.key));
  };

  return (
    <div className={styles.field}>
      <span>{label}</span>
      <div className={styles.row}>
        {proofs.map((proof) => (
          <div key={proof.key} className={styles.preview}>
            <img src={proof.preview} alt="Скриншот" className={styles.image} />
            <button
              type="button"
              className={styles.remove}
              onClick={() => remove(proof)}
              aria-label="Убрать скриншот"
              disabled={disabled}
            >
              ×
            </button>
          </div>
        ))}
        <label className={`${styles.add} ${uploading ? styles.addBusy : ''}`}>
          {uploading ? '…' : '+'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFiles}
            className={styles.input}
            disabled={uploading || disabled}
          />
        </label>
      </div>
      <span className={styles.hint}>JPEG, PNG, WebP или GIF до 10 МБ, до 10 штук.</span>
    </div>
  );
};

export default ProofUploader;

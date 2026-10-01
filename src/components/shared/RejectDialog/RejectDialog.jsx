import React, { useEffect, useRef, useState } from 'react';
import Icon from '../Icon/Icon';
import FieldError from '../FieldError/FieldError';
import ui from '../../../shared/ui.module.css';
import styles from './RejectDialog.module.css';

const REASON_LIMIT = 2000;

const RejectDialog = ({ subject, busy = false, onCancel, onConfirm }) => {
  const dialogRef = useRef(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const open = Boolean(subject);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setReason('');
      setError('');
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleCancel = (event) => {
    event.preventDefault();
    if (!busy) onCancel();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Напишите причину — без неё отклонить нельзя');
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={handleCancel}
      onClick={(event) => event.target === dialogRef.current && handleCancel(event)}
      aria-labelledby="reject-dialog-title"
    >
      <form className={styles.body} onSubmit={handleSubmit} noValidate>
        <header className={styles.head}>
          <div>
            <h2 id="reject-dialog-title" className={styles.title}>
              Отклонить работу
            </h2>
            {subject && <p className={styles.subject}>{subject}</p>}
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={handleCancel}
            disabled={busy}
            aria-label="Закрыть"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <label className={ui.label} htmlFor="reject-dialog-reason">
          Причина отказа
        </label>
        <textarea
          id="reject-dialog-reason"
          className={ui.textarea}
          value={reason}
          maxLength={REASON_LIMIT}
          onChange={(event) => {
            setReason(event.target.value);
            if (error) setError('');
          }}
          placeholder="Например: ролик не по брифу — нет упоминания бренда в первые 5 секунд"
          autoFocus
          disabled={busy}
        />
        <FieldError>{error}</FieldError>
        <span className={ui.hint}>Креатор увидит этот текст в карточке работы.</span>

        <div className={styles.actions}>
          <button type="button" className={ui.btnGhost} onClick={handleCancel} disabled={busy}>
            Отмена
          </button>
          <button type="submit" className={ui.btnDanger} disabled={busy}>
            {busy ? 'Отклоняем…' : 'Отклонить'}
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default RejectDialog;

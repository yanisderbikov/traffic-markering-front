import React, { useEffect, useRef } from 'react';
import ui from '../../../shared/ui.module.css';
import styles from './SubmitConfirmDialog.module.css';

/** Предупреждение перед подачей ролика: просмотры фиксируются один раз, в момент подачи. */
const SubmitConfirmDialog = ({
  open,
  busy = false,
  onCancel,
  onConfirm,
  title = 'Отправить ролик на проверку?',
  confirmLabel = 'Отправить сейчас',
  cancelLabel = 'Подам позже',
  children,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleCancel = (event) => {
    event.preventDefault();
    if (!busy) onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onCancel={handleCancel}
      onClick={(event) => event.target === dialogRef.current && handleCancel(event)}
      aria-labelledby="submit-confirm-title"
    >
      <div className={styles.body}>
        <h2 id="submit-confirm-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.text}>{children}</p>
        <div className={styles.actions}>
          <button type="button" className={ui.btnGhost} onClick={handleCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className={ui.btnPrimary} onClick={onConfirm} disabled={busy} autoFocus>
            {busy ? 'Отправляем…' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default SubmitConfirmDialog;

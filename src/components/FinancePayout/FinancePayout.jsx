import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import TransferCard from '../shared/TransferCard/TransferCard';
import ProofUploader from '../shared/ProofUploader/ProofUploader';
import FieldError from '../shared/FieldError/FieldError';
import Field from '../shared/Field/Field';
import Icon from '../shared/Icon/Icon';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import ui from '../../shared/ui.module.css';
import styles from './FinancePayout.module.css';

const FinancePayout = () => {
  const { payoutId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [txId, setTxId] = useState('');
  const [comment, setComment] = useState('');
  const [proofs, setProofs] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.api.financeOperation(Number(payoutId));
      setDetail(res.data);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить заявку'));
    } finally {
      setLoading(false);
    }
  }, [payoutId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const amount = formatRubles(Math.abs(detail?.transaction?.amountKopecks ?? 0));

  const markSent = async () => {
    const nextErrors = {
      txId: txId.trim() ? '' : 'Укажите номер транзакции',
      proofs: proofs.length ? '' : 'Приложите хотя бы один скриншот отправки',
    };
    setErrors(nextErrors);
    if (nextErrors.txId || nextErrors.proofs) return;
    if (!window.confirm(`Отметить выплату ${amount} отправленной? Креатор увидит её в кабинете.`)) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await apiClient.api.markPayoutSent(Number(payoutId), {
        txId: txId.trim(),
        comment: comment.trim() || undefined,
        proofKeys: proofs.map((proof) => proof.key),
      });
      setDetail(res.data);
      setProofs([]);
      setTxId('');
      setComment('');
      toast.success('Заявка отмечена отправленной');
    } catch (err) {
      setError(errorMessage(err, 'Не удалось отметить заявку'));
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    const reason = window.prompt('Причина отклонения — её увидит креатор. Деньги вернутся ему в доступные.');
    if (reason == null) return;
    if (!reason.trim()) {
      toast.error('Без причины отклонить нельзя');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await apiClient.api.rejectOperation(Number(payoutId), { reason: reason.trim() });
      setDetail(res.data);
      toast.success('Заявка отклонена, деньги возвращены креатору');
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось отклонить заявку'));
    } finally {
      setBusy(false);
    }
  };

  const backLink = (
    <Link to="/app/finance/payouts" className={ui.backLink}>
      <Icon name="arrowLeft" size={16} />
      Ко всем заявкам
    </Link>
  );

  if (loading) {
    return (
      <div className={`${ui.page} ${styles.narrow}`}>
        {backLink}
        <p className={ui.message}>Загрузка заявки…</p>
      </div>
    );
  }

  if (pageError && !detail) {
    return (
      <div className={`${ui.page} ${styles.narrow}`}>
        {backLink}
        <p className={ui.errorBanner}>{pageError}</p>
      </div>
    );
  }

  const transaction = detail.transaction;
  const status = transaction.status;

  return (
    <div className={`${ui.page} ${styles.narrow}`}>
      {backLink}
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Финансы</span>
          <h1 className={ui.title}>Заявка на выплату</h1>
        </div>
      </header>

      <TransferCard detail={detail} showOwner>
        {status === 'PENDING' && (
          <div className={styles.sendForm}>
            <h2 className={ui.cardTitle}>Отправка USDT</h2>
            <p className={styles.formText}>
              Переведите {amount} в USDT (TRC-20) на адрес выше, укажите номер транзакции и
              приложите скриншот — заявка перейдёт в ожидание подтверждения от креатора.
            </p>
            <Field label="Номер транзакции *">
              <input
                type="text"
                value={txId}
                onChange={(e) => {
                  setTxId(e.target.value);
                  setErrors((prev) => ({ ...prev, txId: '' }));
                  setError('');
                }}
                className={ui.input}
                aria-invalid={errors.txId ? 'true' : undefined}
                maxLength={255}
                autoComplete="off"
                spellCheck={false}
                disabled={busy}
              />
              <FieldError>{errors.txId}</FieldError>
            </Field>
            <div>
              <ProofUploader
                proofs={proofs}
                onChange={(next) => {
                  setProofs(next);
                  setErrors((prev) => ({ ...prev, proofs: '' }));
                }}
                disabled={busy}
                label="Скриншоты отправки *"
              />
              <FieldError>{errors.proofs}</FieldError>
            </div>
            <Field label="Ссылка на транзакцию, комментарий">
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setError('');
                }}
                className={ui.textarea}
                rows={3}
                maxLength={2000}
                disabled={busy}
              />
            </Field>
            {error && <p className={ui.errorText}>{error}</p>}
            <div className={styles.actions}>
              <button type="button" className={ui.btnPrimary} onClick={markSent} disabled={busy}>
                {busy ? 'Сохраняем…' : 'Отправлено'}
              </button>
              <button type="button" className={ui.btnDanger} onClick={reject} disabled={busy}>
                Отклонить
              </button>
            </div>
          </div>
        )}
        {status === 'SENT' && (
          <div className={styles.sendForm}>
            <p className={styles.formText}>
              Ждём, когда креатор подтвердит получение. Если перевод не прошёл — отклоните заявку,
              деньги вернутся креатору в доступные.
            </p>
            <div className={styles.actions}>
              <button type="button" className={ui.btnDanger} onClick={reject} disabled={busy}>
                Отклонить
              </button>
            </div>
          </div>
        )}
      </TransferCard>
    </div>
  );
};

export default FinancePayout;

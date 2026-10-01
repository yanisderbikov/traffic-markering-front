import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { FraudBadge, TrustBadge } from '../shared/FraudBadge/FraudBadge';
import AdminListSkeleton from '../AdminFraud/AdminListSkeleton';
import RejectDialog from '../shared/RejectDialog/RejectDialog';
import { errorMessage } from '../../shared/auth';
import { formatRubles } from '../../shared/money';
import { PLATFORM_LABELS, formatDate } from '../../shared/dictionaries';
import ui from '../../shared/ui.module.css';
import styles from '../AdminFraud/AdminFraud.module.css';

const MODERATION_URL = '/api/admin/moderation/applications';

const AdminModeration = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.instance.get(MODERATION_URL);
      setItems(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(errorMessage(err, 'Не удалось загрузить очередь модерации'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (application, status, reason) => {
    setBusyId(application.id);
    try {
      await apiClient.instance.patch(`${MODERATION_URL}/${application.id}`, { status, reason });
      toast.success(`${application.publicId}: ${status === 'APPROVED' ? 'одобрен' : 'отклонён'}`);
      setItems((current) => current.filter((item) => item.id !== application.id));
      setRejecting(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Не удалось сохранить решение'));
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Модерация</span>
          <h1 className={ui.title}>Ролики на проверке</h1>
          <p className={ui.subtitle}>
            Креатор приложил ролик — работа ждёт решения. Пока её не одобрили, деньги за просмотры не
            начисляются. Отклонить можно только с причиной: креатор увидит её в карточке работы.
          </p>
        </div>
        <div className={ui.pageHeadActions}>
          <button
            type="button"
            className={ui.btnSecondary}
            onClick={() => {
              setLoading(true);
              load();
            }}
            disabled={loading}
          >
            Обновить
          </button>
        </div>
      </header>

      <section className={ui.card}>
        {pageError && <p className={ui.errorBanner}>{pageError}</p>}

        {loading ? (
          <AdminListSkeleton />
        ) : items.length === 0 ? (
          <p className={ui.message}>Очередь пуста: все ролики проверены.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((application) => {
              const busy = busyId === application.id;
              return (
                <li key={application.id} className={styles.item}>
                  <div className={styles.itemHead}>
                    <div className={styles.who}>
                      <span className={styles.name}>{application.creatorName}</span>
                      {application.creatorTelegram && (
                        <span className={styles.email}>{application.creatorTelegram}</span>
                      )}
                      <TrustBadge level={application.creatorTrustLevel} />
                    </div>
                    <div className={styles.badges}>
                      <FraudBadge status={application.fraudStatus} score={application.fraudScore} />
                      <span className={ui.chipOutline}>{application.publicId}</span>
                    </div>
                  </div>

                  <p className={styles.meta}>
                    {application.campaignTitle}
                    {' · '}
                    {PLATFORM_LABELS[application.platform] || application.platform}
                    {' · '}
                    {formatRubles(application.ratePerThousandKopecks ?? 0)} за 1000
                    {' · подан '}
                    {formatDate(application.updatedAt || application.createdAt)}
                  </p>

                  <a className={styles.videoLink} href={application.videoUrl} target="_blank" rel="noreferrer">
                    {application.videoUrl}
                  </a>

                  {application.comment && <p className={styles.review}>{application.comment}</p>}

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={`${ui.btnPrimary} ${ui.btnSmall}`}
                      onClick={() => decide(application, 'APPROVED')}
                      disabled={busy}
                    >
                      Одобрить
                    </button>
                    <button
                      type="button"
                      className={`${ui.btnDanger} ${ui.btnSmall}`}
                      onClick={() => setRejecting(application)}
                      disabled={busy}
                    >
                      Отклонить
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <RejectDialog
        subject={rejecting && `${rejecting.creatorName} · ${rejecting.campaignTitle}`}
        busy={rejecting != null && busyId === rejecting.id}
        onCancel={() => setRejecting(null)}
        onConfirm={(reason) => decide(rejecting, 'REJECTED', reason)}
      />
    </div>
  );
};

export default AdminModeration;

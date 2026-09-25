import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../../apiClient';
import { formatRubles } from '../../shared/money';
import WorkCard from '../shared/WorkCard/WorkCard';
import Icon from '../shared/Icon/Icon';
import ui from '../../shared/ui.module.css';
import styles from './CreatorApplications.module.css';

const isApproved = (application) =>
  application.status === 'APPROVED' || application.status === 'COMPLETED';
const isActiveWork = (application) =>
  application.status === 'PENDING' || application.status === 'APPROVED';
const isFinishedWork = (application) =>
  application.status === 'COMPLETED' || application.status === 'REJECTED';

const TABS = [
  { id: 'active', label: 'В работе', match: isActiveWork },
  { id: 'finished', label: 'Завершённые', match: isFinishedWork },
  { id: 'all', label: 'Все', match: () => true },
];

const EMPTY_TITLE = {
  active: 'Пока нет работ в процессе',
  finished: 'Завершённых работ пока нет',
  all: 'Работ пока нет',
};

const CreatorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [tab, setTab] = useState('active');

  const loadApplications = useCallback(async () => {
    try {
      const res = await apiClient.api.myApplications();
      setApplications(Array.isArray(res.data) ? res.data : []);
      setPageError('');
    } catch (err) {
      setPageError(
        err?.response?.data?.message || err?.message || 'Не удалось загрузить работы'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadApplications();
    } finally {
      setRefreshing(false);
    }
  };

  const handleWithdraw = async (application) => {
    if (!window.confirm(`Отозвать отклик на «${application.campaignTitle}»?`)) return;
    setBusyId(application.id);
    try {
      await apiClient.api.deleteApplication(application.id);
      toast.success('Отклик отозван');
      await loadApplications();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Не удалось отозвать отклик'
      );
    } finally {
      setBusyId(null);
    }
  };

  const approvedCount = applications.filter(isApproved).length;
  const earnedKopecks = applications.reduce(
    (sum, application) => sum + (application.accruedKopecks || 0),
    0
  );
  const activeTab = TABS.find((item) => item.id === tab) || TABS[0];
  const shown = applications.filter(activeTab.match);

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Креатор</span>
          <h1 className={ui.title}>Мои работы</h1>
          <p className={ui.subtitle}>
            Отклики на офферы, этапы по каждой работе и начисления за просмотры.
          </p>
        </div>
        <div className={`${ui.pageHeadActions} ${styles.headActions}`}>
          <button
            type="button"
            className={ui.btnSecondary}
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Обновить список работ"
          >
            <Icon name="refresh" size={16} className={refreshing ? styles.spinning : ''} />
            Обновить
          </button>
          <Link to="/app/board" className={ui.btnPrimary}>
            Найти новый оффер
          </Link>
        </div>
      </header>

      <div className={ui.grid3}>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Всего работ</span>
          <span className={ui.statValue}>{loading ? '…' : applications.length}</span>
          <span className={ui.statNote}>откликов на офферы</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>В работе</span>
          <span className={ui.statValue}>{loading ? '…' : approvedCount}</span>
          <span className={ui.statNote}>одобрено брендом</span>
        </div>
        <div className={ui.stat}>
          <span className={ui.statLabel}>Заработано</span>
          <span className={`${ui.statValue} ${ui.statUp}`}>
            {loading ? '…' : formatRubles(earnedKopecks)}
          </span>
          <span className={ui.statNote}>начислено за просмотры</span>
        </div>
      </div>

      {pageError && <p className={`${ui.errorBanner} ${styles.banner}`}>{pageError}</p>}

      <div className={`${ui.chips} ${styles.tabs}`} role="tablist" aria-label="Фильтр работ">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? ui.chipActive : ui.chip}
            onClick={() => setTab(item.id)}
          >
            {item.label} {applications.filter(item.match).length}
          </button>
        ))}
      </div>

      {loading ? (
        <p className={ui.message}>Загрузка работ…</p>
      ) : shown.length === 0 ? (
        <div className={ui.empty}>
          <p className={ui.emptyTitle}>{EMPTY_TITLE[tab]}</p>
          <p className={ui.emptyText}>
            Выберите оффер, снимите ролик и приложите ссылку. Деньги начисляются по мере набора
            просмотров.
          </p>
          <Link to="/app/board" className={ui.btnPrimary}>
            К офферам
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {shown.map((application) => (
            <WorkCard
              key={application.id}
              application={application}
              onWithdraw={handleWithdraw}
              busy={busyId === application.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorApplications;

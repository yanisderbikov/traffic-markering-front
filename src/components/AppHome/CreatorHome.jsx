import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../apiClient';
import { useRequest } from './useRequest';
import { applicationStats, asList, awaitingPayoutConfirmations, plural } from './homeStats';
import { errorMessage } from '../../shared/auth';
import { formatRubles, formatViews, signedRubles } from '../../shared/money';
import { PLATFORM_LABELS } from '../../shared/dictionaries';
import { formatShortDate } from '../../shared/dates';
import WorkCard, { WorkCardSkeleton } from '../shared/WorkCard/WorkCard';
import FitRubles from '../shared/FitRubles/FitRubles';
import Skeleton from '../shared/Skeleton/Skeleton';
import ui from '../../shared/ui.module.css';
import styles from './AppHome.module.css';

const LOADERS = {
  earnings: () => apiClient.api.myEarnings(),
  applications: () => apiClient.api.myApplications(),
  operations: () => apiClient.api.myOperations(),
  accounts: () => apiClient.instance.get('/api/social/accounts'),
};

const SKELETON_WORKS = 2;
const SKELETON_ACCRUALS = 3;

const isActiveWork = (row) => row.status === 'PENDING' || row.status === 'APPROVED';
const isFinishedWork = (row) => row.status === 'COMPLETED' || row.status === 'REJECTED';

const CreatorHome = () => {
  const userName = apiClient.getJwtMetadata()?.name;
  const earnings = useRequest(true, LOADERS.earnings);
  const applications = useRequest(true, LOADERS.applications);
  const operations = useRequest(true, LOADERS.operations);
  const accounts = useRequest(true, LOADERS.accounts);
  const [tab, setTab] = useState('active');

  const wallet = earnings.data;
  const rows = asList(applications.data);
  const stats = applicationStats(rows);
  const activeRows = rows.filter(isActiveWork);
  const finishedRows = rows.filter(isFinishedWork);
  const shown = (tab === 'active' ? activeRows : finishedRows).slice(0, 3);

  const accruals = asList(operations.data)
    .filter((row) => row.type === 'EARNING')
    .slice(0, 3);
  const awaitingPayouts = awaitingPayoutConfirmations(operations.data);

  const connected = asList(accounts.data)
    .filter((account) => account.status === 'ACTIVE')
    .map((account) => PLATFORM_LABELS[account.platform] || account.platform);
  const connectedLabel = [...new Set(connected)].join(' · ');

  const balance = wallet?.balanceKopecks ?? 0;
  const pending = wallet?.pendingKopecks ?? 0;

  return (
    <div className={ui.page}>
      <header className={ui.pageHead}>
        <div className={ui.pageHeadMain}>
          <span className={ui.eyebrow}>Креатор</span>
          <h1 className={ui.title}>{userName ? `Привет, ${userName}` : 'Привет'}</h1>
          <p className={ui.subtitle}>Твои идеи работают. Посмотрим на результат.</p>
        </div>
        <div className={ui.pageHeadActions}>
          <Link to="/app/board" className={ui.btnPrimary}>
            Найти новый оффер
          </Link>
        </div>
      </header>

      {awaitingPayouts > 0 && (
        <Link to="/app/earnings" className={styles.attention}>
          <span className={styles.attentionCount}>{awaitingPayouts}</span>
          <span>
            {plural(awaitingPayouts, ['выплата ждёт', 'выплаты ждут', 'выплат ждут'])} вашего
            подтверждения
          </span>
          <span className={styles.attentionArrow}>→</span>
        </Link>
      )}

      <div className={styles.creatorTop}>
        <section className={styles.balance}>
          <span className={styles.balanceLabel}>Доступно к выводу</span>
          {earnings.loading ? (
            <span className={styles.balanceValue}>
              <Skeleton width="6ch" />
            </span>
          ) : (
            <FitRubles className={styles.balanceValue} kopecks={balance} />
          )}
          <div className={styles.balanceRow}>
            <span className={styles.balanceNote}>
              {earnings.loading ? (
                <Skeleton width="16rem" />
              ) : earnings.error ? (
                errorMessage(earnings.error, 'Не удалось загрузить кошелёк')
              ) : pending > 0 ? (
                `Ещё ${formatRubles(pending)} ожидают подтверждения`
              ) : (
                'Начисления приходят после проверки просмотров'
              )}
            </span>
            <Link to="/app/earnings" className={ui.btnOnAccent}>
              Вывести средства
            </Link>
          </div>
        </section>

        <div className={styles.creatorStats}>
          <div className={ui.stat}>
            <span className={ui.statLabel}>Твои просмотры</span>
            <span className={ui.statValue}>
              {applications.loading ? <Skeleton width="5ch" /> : formatViews(stats.views)}
            </span>
            <span className={ui.statNote}>по одобренным работам</span>
          </div>
          <div className={ui.stat}>
            <span className={ui.statLabel}>Активные работы</span>
            <span className={ui.statValue}>
              {applications.loading ? <Skeleton width="2ch" /> : stats.approved}
            </span>
            <span className={ui.statNote}>
              {applications.loading ? (
                <Skeleton width="70%" />
              ) : stats.pending > 0 ? (
                `${stats.pending} ${plural(stats.pending, ['ждёт', 'ждут', 'ждут'])} решения бренда`
              ) : (
                'всё одобрено'
              )}
            </span>
          </div>
          <div className={styles.connected}>
            <span className={ui.muted}>
              {accounts.loading ? (
                <Skeleton width="14rem" />
              ) : connectedLabel ? (
                `Подключено: ${connectedLabel}`
              ) : (
                'Соцсети не подключены'
              )}
            </span>
            <Link to="/app/profile/socials" className={ui.linkAccent}>
              Управлять →
            </Link>
          </div>
        </div>
      </div>

      <div className={ui.sectionHead}>
        <h2 className={ui.sectionTitle}>Мои работы</h2>
        <Link to="/app/applications" className={ui.sectionLink}>
          Все работы →
        </Link>
      </div>
      <div className={ui.chips} role="tablist" aria-label="Фильтр работ">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'active'}
          className={tab === 'active' ? ui.chipActive : ui.chip}
          onClick={() => setTab('active')}
        >
          В работе {applications.loading ? <Skeleton width="1ch" /> : activeRows.length}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'finished'}
          className={tab === 'finished' ? ui.chipActive : ui.chip}
          onClick={() => setTab('finished')}
        >
          Завершённые {applications.loading ? <Skeleton width="1ch" /> : finishedRows.length}
        </button>
      </div>

      <div className={styles.works}>
        {applications.error ? (
          <p className={ui.errorBanner}>
            {errorMessage(applications.error, 'Не удалось загрузить работы')}
          </p>
        ) : applications.loading ? (
          Array.from({ length: SKELETON_WORKS }, (_, index) => <WorkCardSkeleton key={index} />)
        ) : shown.length === 0 ? (
          <div className={ui.empty}>
            <p className={ui.emptyTitle}>
              {tab === 'active' ? 'Пока нет работ в процессе' : 'Завершённых работ пока нет'}
            </p>
            <p className={ui.emptyText}>
              Выберите оффер, снимите ролик и приложите ссылку. Деньги начисляются по просмотрам.
            </p>
            <Link to="/app/board" className={ui.btnPrimary}>
              К офферам
            </Link>
          </div>
        ) : (
          shown.map((row) => <WorkCard key={row.id} application={row} />)
        )}
      </div>

      <div className={ui.sectionHead}>
        <h2 className={ui.sectionTitle}>Последние начисления</h2>
        <Link to="/app/earnings" className={ui.sectionLink}>
          Финансы →
        </Link>
      </div>
      <section className={ui.card}>
        {operations.error ? (
          <p className={ui.errorText}>
            {errorMessage(operations.error, 'Не удалось загрузить начисления')}
          </p>
        ) : operations.loading ? (
          <ul className={styles.accruals} aria-busy="true">
            {Array.from({ length: SKELETON_ACCRUALS }, (_, index) => (
              <li key={index}>
                <span className={styles.accrual}>
                  <Skeleton width={36} height={36} radius={10} />
                  <span className={styles.accrualBody}>
                    <span className={styles.accrualTitle}>
                      <Skeleton width="16rem" />
                    </span>
                    <span className={styles.accrualMeta}>
                      <Skeleton width="6rem" />
                    </span>
                  </span>
                  <span className={styles.accrualAmount}>
                    <Skeleton width="6ch" />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : accruals.length === 0 ? (
          <p className={ui.message}>
            Начислений пока нет. Они появятся, когда просмотры по одобренной работе пройдут проверку.
          </p>
        ) : (
          <ul className={styles.accruals}>
            {accruals.map((row) => (
              <li key={row.id}>
                <Link to={`/app/earnings/${row.id}`} className={styles.accrual}>
                  <span className={styles.accrualIcon} aria-hidden="true">
                    ₽
                  </span>
                  <span className={styles.accrualBody}>
                    <span className={styles.accrualTitle}>
                      {row.subtitle || row.title || 'Начисление за просмотры'}
                    </span>
                    <span className={styles.accrualMeta}>{formatShortDate(row.createdAt)}</span>
                  </span>
                  <span className={styles.accrualAmount}>{signedRubles(row.amountKopecks)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default CreatorHome;

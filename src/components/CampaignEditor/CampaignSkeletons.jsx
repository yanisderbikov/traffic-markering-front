import React from 'react';
import Skeleton, { SkeletonPageHead, SkeletonText } from '../shared/Skeleton/Skeleton';
import { CAMPAIGN_STEPS } from './campaignForm';
import ui from '../../shared/ui.module.css';
import styles from './CampaignEditor.module.css';

const SKELETON_STATS = 4;
const SKELETON_FIELDS = 3;

export const CampaignOverviewSkeleton = () => (
  <>
    <SkeletonPageHead eyebrow="Рекламодатель" />
    <div className={ui.grid4}>
      {Array.from({ length: SKELETON_STATS }, (_, index) => (
        <div key={index} className={ui.stat}>
          <span className={ui.statLabel}>
            <Skeleton width="65%" />
          </span>
          <span className={ui.statValue}>
            <Skeleton width="5ch" />
          </span>
          <span className={ui.statNote}>
            <Skeleton width="45%" />
          </span>
        </div>
      ))}
    </div>
    <div className={styles.analytics}>
      <section className={ui.card}>
        <h2 className={ui.cardTitle}>Бюджет кампании</h2>
        <p className={styles.bigMoney}>
          <Skeleton width="7ch" />
        </p>
        <SkeletonText lines={2} />
      </section>
      <section className={ui.card}>
        <h2 className={ui.cardTitle}>Воронка кампании</h2>
        <SkeletonText lines={4} lastWidth="80%" />
      </section>
    </div>
  </>
);

export const CampaignFormSkeleton = ({ stepper = false }) => (
  <>
    <SkeletonPageHead eyebrow="Рекламодатель" />
    {stepper && (
      <ol className={styles.stepper}>
        {CAMPAIGN_STEPS.map((item) => (
          <li key={item.id} className={styles.stepperItem}>
            <span className={styles.stepperButton}>
              <Skeleton width={32} height={32} radius="50%" />
              <Skeleton width="60%" />
            </span>
          </li>
        ))}
      </ol>
    )}
    <div className={styles.editor}>
      <div className={styles.formColumn}>
        <section className={ui.card}>
          <h2 className={styles.formTitle}>
            <Skeleton width="12rem" />
          </h2>
          {Array.from({ length: SKELETON_FIELDS }, (_, index) => (
            <div key={index} className={styles.field}>
              <span className={ui.label}>
                <Skeleton width="9rem" />
              </span>
              <Skeleton block height={index === 1 ? 120 : 48} radius="var(--field-radius)" />
            </div>
          ))}
        </section>
      </div>
      <aside className={styles.preview}>
        <section className={ui.card}>
          <h2 className={ui.cardTitle}>Предпросмотр оффера</h2>
          <p className={styles.previewTitle}>
            <Skeleton width="70%" />
          </p>
          <SkeletonText lines={3} />
        </section>
      </aside>
    </div>
  </>
);

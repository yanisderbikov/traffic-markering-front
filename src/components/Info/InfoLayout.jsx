import React from 'react';
import PublicLayout from '../shared/PublicLayout/PublicLayout';
import { CONTACT_EMAIL, UPDATED_AT } from './legal';
import ui from '../../shared/ui.module.css';
import styles from './Info.module.css';

const InfoLayout = ({ title, lead, showUpdated = true, children }) => (
  <PublicLayout>
    <article className={styles.article}>
      <header className={styles.head}>
        <h1 className={ui.title}>{title}</h1>
        {lead && <p className={ui.subtitle}>{lead}</p>}
        {showUpdated && <p className={styles.updated}>Редакция от {UPDATED_AT}</p>}
      </header>
      {children}
      <p className={styles.contact}>
        Вопросы:{' '}
        <a className={styles.link} href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </article>
  </PublicLayout>
);

export default InfoLayout;

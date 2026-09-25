import React from 'react';
import toast from 'react-hot-toast';
import { formatRubles, signedRubles } from '../../../shared/money';
import { WALLET_TRANSACTION_LABELS, formatDate } from '../../../shared/dictionaries';
import { MoneyFlow, StatusBadge } from '../OperationRows/OperationRows';
import Icon from '../Icon/Icon';
import styles from './TransferCard.module.css';

const URL_SPLIT_RE = /(https?:\/\/\S+)/g;
const URL_RE = /^https?:\/\/\S+$/;
const PDF_RE = /\.pdf$/i;

const linkify = (text) =>
  text.split(URL_SPLIT_RE).map((part, index) =>
    URL_RE.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noreferrer" className={styles.link}>
        {part}
      </a>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    )
  );

const copy = async (value, done) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(done);
  } catch {
    toast.error('Не удалось скопировать — выделите текст вручную');
  }
};

const SENT_LABEL = {
  TOP_UP: 'Оплачена',
  WITHDRAWAL: 'Отправлена',
  PAYOUT: 'Отправлена',
};

const CONFIRMED_LABEL = {
  TOP_UP: 'Зачислена',
};

const ACTOR_LABEL = {
  PAYOUT: 'Заявку подал',
  TOP_UP: 'Создал',
};

const SETTLED_STATUSES = ['DONE', 'CONFIRMED'];

const OWNER_LABEL = {
  PAYOUT: 'Креатор',
  TOP_UP: 'Рекламодатель',
  WITHDRAWAL: 'Рекламодатель',
};

const TransferCard = ({ detail, showOwner = false, children }) => {
  const transaction = detail?.transaction;
  const transfer = detail?.transfer;
  if (!transaction) return null;

  const isPayout = transaction.type === 'PAYOUT';
  const isTopUp = transaction.type === 'TOP_UP';
  const showBalanceAfter = !isTopUp || SETTLED_STATUSES.includes(transaction.status);
  const timeline = [
    { label: 'Создана', at: transaction.createdAt },
    transfer?.sentAt && { label: SENT_LABEL[transaction.type] || 'Отправлена', at: transfer.sentAt },
    transfer?.confirmedAt && {
      label: CONFIRMED_LABEL[transaction.type] || 'Подтверждена',
      at: transfer.confirmedAt,
    },
    transfer?.closedAt &&
      !transfer?.confirmedAt && {
        label: transaction.status === 'CANCELLED' ? 'Отменена' : 'Отклонена',
        at: transfer.closedAt,
      },
  ].filter(Boolean);

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headMain}>
          <span className={styles.type}>
            {WALLET_TRANSACTION_LABELS[transaction.type] ||
              transaction.typeDescription ||
              transaction.type}
          </span>
          <span
            className={`${styles.amount} ${transaction.amountKopecks > 0 ? styles.amountIn : ''}`}
          >
            {signedRubles(transaction.amountKopecks)}
          </span>
        </div>
        <StatusBadge
          type={transaction.type}
          status={transaction.status}
          description={transaction.statusDescription}
        />
      </div>

      <dl className={styles.facts}>
        <dt>Откуда → куда</dt>
        <dd>
          <MoneyFlow source={transaction.source} destination={transaction.destination} />
        </dd>
        {transaction.ownerName && (
          <>
            <dt>Кошелёк</dt>
            <dd>{transaction.ownerName}</dd>
          </>
        )}
        {showOwner && transfer && (
          <>
            <dt>{OWNER_LABEL[transaction.type] || 'Владелец'}</dt>
            <dd>
              {transfer.ownerName}
              {transfer.ownerEmail ? ` · ${transfer.ownerEmail}` : ''}
            </dd>
          </>
        )}
        {transaction.campaignTitle && (
          <>
            <dt>Кампания</dt>
            <dd>{transaction.campaignTitle}</dd>
          </>
        )}
        {transfer?.tronAddress && (
          <>
            <dt>{isTopUp ? 'Адрес для оплаты' : 'Кошелёк TRON'}</dt>
            <dd className={styles.addressRow}>
              <code className={styles.address}>{transfer.tronAddress}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copy(transfer.tronAddress, 'Адрес скопирован')}
              >
                <Icon name="copy" size={14} />
                Копировать
              </button>
            </dd>
          </>
        )}
        {transfer?.txId && (
          <>
            <dt>Номер транзакции</dt>
            <dd className={styles.addressRow}>
              <code className={styles.address}>{transfer.txId}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copy(transfer.txId, 'Номер транзакции скопирован')}
              >
                <Icon name="copy" size={14} />
                Копировать
              </button>
            </dd>
          </>
        )}
        {!isPayout && transaction.comment && (
          <>
            <dt>{transfer ? 'Основание' : 'Комментарий'}</dt>
            <dd>{transaction.comment}</dd>
          </>
        )}
        {transaction.actorName && (
          <>
            <dt>{ACTOR_LABEL[transaction.type] || 'Провёл'}</dt>
            <dd>{transaction.actorName}</dd>
          </>
        )}
        {isTopUp && transfer?.processedByName && (
          <>
            <dt>Проверил</dt>
            <dd>{transfer.processedByName}</dd>
          </>
        )}
        {showBalanceAfter && (
          <>
            <dt>Остаток после</dt>
            <dd>{formatRubles(transaction.balanceAfterKopecks ?? 0)}</dd>
          </>
        )}
        <dt>История</dt>
        <dd className={styles.timeline}>
          {timeline.map((step) => (
            <span key={step.label} className={styles.step}>
              {step.label} {formatDate(step.at)}
            </span>
          ))}
        </dd>
      </dl>

      {transfer?.rejectReason && (
        <div className={styles.reject}>
          <span className={styles.blockTitle}>Причина отказа</span>
          <p className={styles.rejectText}>{transfer.rejectReason}</p>
        </div>
      )}

      {transfer && (transfer.financeComment || transfer.proofs?.length > 0) && (
        <div className={styles.proofBlock}>
          <span className={styles.blockTitle}>
            {isTopUp
              ? 'Подтверждение оплаты'
              : `Документы перевода${transfer.processedByName ? ` · ${transfer.processedByName}` : ''}`}
          </span>
          {transfer.financeComment && (
            <p className={styles.text}>{linkify(transfer.financeComment)}</p>
          )}
          {transfer.proofs?.length > 0 && (
            <div className={styles.proofs}>
              {transfer.proofs.map((proof) => (
                <a
                  key={proof.key}
                  href={proof.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.proof}
                >
                  {PDF_RE.test(proof.key) ? (
                    <span className={styles.proofFile}>
                      <Icon name="file" size={28} />
                      PDF
                    </span>
                  ) : (
                    <img src={proof.url} alt="Скриншот перевода" className={styles.proofImage} />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {children}
    </section>
  );
};

export default TransferCard;

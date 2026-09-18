import React from 'react';
import toast from 'react-hot-toast';
import { formatRubles, signedRubles } from '../../../shared/money';
import { WALLET_TRANSACTION_LABELS, formatDate } from '../../../shared/dictionaries';
import { MoneyFlow, StatusBadge } from '../OperationRows/OperationRows';
import styles from './TransferCard.module.css';

const URL_SPLIT_RE = /(https?:\/\/\S+)/g;
const URL_RE = /^https?:\/\/\S+$/;

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
  TOP_UP: 'зачислена',
  WITHDRAWAL: 'отправлена',
  PAYOUT: 'отправлена',
};

const OWNER_LABEL = {
  PAYOUT: 'криатор',
  TOP_UP: 'заказчик',
  WITHDRAWAL: 'заказчик',
};

const TransferCard = ({ detail, showOwner = false, children }) => {
  const transaction = detail?.transaction;
  const transfer = detail?.transfer;
  if (!transaction) return null;

  const isPayout = transaction.type === 'PAYOUT';
  const timeline = [
    { label: 'создана', at: transaction.createdAt },
    transfer?.sentAt && { label: SENT_LABEL[transaction.type] || 'отправлена', at: transfer.sentAt },
    transfer?.confirmedAt && { label: 'подтверждена', at: transfer.confirmedAt },
    transfer?.closedAt &&
      !transfer?.confirmedAt && {
        label: transaction.status === 'CANCELLED' ? 'отменена' : 'отклонена',
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
        <StatusBadge status={transaction.status} description={transaction.statusDescription} />
      </div>

      <dl className={styles.facts}>
        <dt>откуда → куда</dt>
        <dd>
          <MoneyFlow source={transaction.source} destination={transaction.destination} />
        </dd>
        {transaction.ownerName && (
          <>
            <dt>кошелёк</dt>
            <dd>{transaction.ownerName}</dd>
          </>
        )}
        {showOwner && transfer && (
          <>
            <dt>{OWNER_LABEL[transaction.type] || 'владелец'}</dt>
            <dd>
              {transfer.ownerName}
              {transfer.ownerEmail ? ` · ${transfer.ownerEmail}` : ''}
            </dd>
          </>
        )}
        {transaction.campaignTitle && (
          <>
            <dt>объявление</dt>
            <dd>{transaction.campaignTitle}</dd>
          </>
        )}
        {transfer?.tronAddress && (
          <>
            <dt>кошелёк TRON</dt>
            <dd className={styles.addressRow}>
              <code className={styles.address}>{transfer.tronAddress}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copy(transfer.tronAddress, 'Адрес скопирован')}
              >
                копировать
              </button>
            </dd>
          </>
        )}
        {transfer?.txId && (
          <>
            <dt>номер транзакции</dt>
            <dd className={styles.addressRow}>
              <code className={styles.address}>{transfer.txId}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copy(transfer.txId, 'Номер транзакции скопирован')}
              >
                копировать
              </button>
            </dd>
          </>
        )}
        {!isPayout && transaction.comment && (
          <>
            <dt>{transfer ? 'основание' : 'комментарий'}</dt>
            <dd>{transaction.comment}</dd>
          </>
        )}
        {transaction.actorName && (
          <>
            <dt>{isPayout ? 'заявку подал' : 'провёл'}</dt>
            <dd>{transaction.actorName}</dd>
          </>
        )}
        <dt>остаток после</dt>
        <dd>{formatRubles(transaction.balanceAfterKopecks ?? 0)}</dd>
        <dt>история</dt>
        <dd>
          {timeline.map((step) => (
            <span key={step.label} className={styles.step}>
              {step.label} {formatDate(step.at)}
            </span>
          ))}
        </dd>
      </dl>

      {transfer?.rejectReason && (
        <div className={styles.reject}>
          <span className={styles.blockTitle}>причина отказа</span>
          <p className={styles.text}>{transfer.rejectReason}</p>
        </div>
      )}

      {transfer && (transfer.financeComment || transfer.proofs?.length > 0) && (
        <div className={styles.proofBlock}>
          <span className={styles.blockTitle}>
            документы перевода{transfer.processedByName ? ` · ${transfer.processedByName}` : ''}
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
                  <img src={proof.url} alt="Скриншот перевода" className={styles.proofImage} />
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

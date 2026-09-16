import React from 'react';
import { formatDate } from '../../../shared/dictionaries';
import { formatRubles } from '../../../shared/money';
import styles from './WalletHistory.module.css';

const signedMoney = (amountKopecks) => {
  const amount = Number(amountKopecks || 0);
  if (amount === 0) return formatRubles(0);
  return `${amount > 0 ? '+' : '−'}${formatRubles(Math.abs(amount))}`;
};

const WalletHistory = ({ transactions = [], emptyText = 'Операций пока нет' }) => {
  if (!transactions.length) {
    return <p className={styles.empty}>{emptyText}</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Изменение</th>
            <th>Баланс после</th>
            <th>Причина</th>
            <th>Кто изменил</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const amount = Number(transaction.amountKopecks || 0);
            return (
              <tr key={transaction.id}>
                <td className={styles.nowrap}>{formatDate(transaction.createdAt) || '—'}</td>
                <td
                  className={`${styles.amount} ${
                    amount > 0 ? styles.credit : amount < 0 ? styles.debit : ''
                  }`}
                >
                  {signedMoney(amount)}
                </td>
                <td className={styles.nowrap}>{formatRubles(transaction.balanceAfterKopecks)}</td>
                <td className={styles.reason}>{transaction.reason || '—'}</td>
                <td>{transaction.actorName || 'система'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WalletHistory;

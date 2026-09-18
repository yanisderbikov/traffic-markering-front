export const financeOperationLink = (row) =>
  row.type === 'PAYOUT' ? `/app/finance/payouts/${row.id}` : `/app/finance/operations/${row.id}`;

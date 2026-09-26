export const financeOperationLink = (row) =>
  row.type === 'PAYOUT'
    ? `/app/finance/payouts/${row.publicId}`
    : `/app/finance/operations/${row.publicId}`;

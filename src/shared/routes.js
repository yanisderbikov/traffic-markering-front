export const REGISTER_CUSTOMER = '/register?role=CUSTOMER';
export const REGISTER_CREATOR = '/register?role=CREATOR';

export const financeOperationLink = (row) =>
  row.type === 'PAYOUT'
    ? `/app/finance/payouts/${row.publicId}`
    : `/app/finance/operations/${row.publicId}`;

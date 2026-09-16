import apiClient from '../apiClient';

const dataOf = (request) => request.then((response) => response.data);

/** Wallet API is kept in one place because these endpoints are not part of the generated client yet. */
const walletApi = {
  getCurrent: () => dataOf(apiClient.instance.get('/api/wallet')),
  getCurrentTransactions: () => dataOf(apiClient.instance.get('/api/wallet/transactions')),
  getAdminWallets: () => dataOf(apiClient.instance.get('/api/admin/wallets')),
  getAdminTransactions: (userId) =>
    dataOf(apiClient.instance.get(`/api/admin/wallets/${userId}/transactions`)),
  adjust: (userId, payload) =>
    dataOf(apiClient.instance.post(`/api/admin/wallets/${userId}/adjustments`, payload)),
};

export default walletApi;

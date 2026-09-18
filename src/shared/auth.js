import apiClient from '../apiClient';

export const errorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;

export const verifyCode = async (email, code) => {
  const response = await apiClient.api.verify({ email, code });
  const token = response.data.token;
  if (!token) {
    throw new Error('В ответе сервера нет токена');
  }
  apiClient.setToken(token);
  return response.data;
};

export const safeReturnPath = (from) =>
  from && from.startsWith('/') && !from.startsWith('//') ? from : '/app';

import { REGISTER_CUSTOMER } from './routes';

const STORAGE_KEY = 'referral_invite';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CODE_RE = /^[A-Z0-9]{4,16}$/;

export const normalizeReferralCode = (value) => {
  const code = String(value ?? '').trim().toUpperCase();
  return CODE_RE.test(code) ? code : '';
};

export const rememberReferralCode = (value) => {
  const code = normalizeReferralCode(value);
  if (!code) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, savedAt: Date.now() }));
  } catch (e) {
    console.warn('localStorage недоступен:', e);
  }
};

export const storedReferralCode = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved || Date.now() - Number(saved.savedAt) > TTL_MS) return '';
    return normalizeReferralCode(saved.code);
  } catch {
    return '';
  }
};

export const forgetReferralCode = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('localStorage недоступен:', e);
  }
};

export const inviteLink = (code) => `${window.location.origin}/adv?ref=${encodeURIComponent(code)}`;

export const registerWithReferral = (code) =>
  code ? `${REGISTER_CUSTOMER}&ref=${encodeURIComponent(code)}` : REGISTER_CUSTOMER;

export const partnerEffectivePercent = (partner) =>
  ((Number(partner?.commissionPercent) || 0) * (Number(partner?.partnerSharePercent) || 0)) / 100;

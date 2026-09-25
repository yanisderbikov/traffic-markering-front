import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme';
const PREFERENCES = ['auto', 'light', 'dark'];

const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)');
const listeners = new Set();

const readStoredPreference = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return PREFERENCES.includes(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
};

let preference = readStoredPreference();

const resolveTheme = () => {
  if (preference !== 'auto') return preference;
  return systemPrefersLight.matches ? 'light' : 'dark';
};

const applyTheme = () => {
  const root = document.documentElement;
  root.dataset.theme = resolveTheme();
  const pageColor = getComputedStyle(root).getPropertyValue('--color-page').trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', pageColor);
};

const changePreference = (next) => {
  preference = next;
  applyTheme();
  listeners.forEach((listener) => listener());
};

export const setThemePreference = (next) => {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch (e) {
    console.warn('localStorage недоступен:', e);
  }
  changePreference(next);
};

export const initTheme = () => {
  applyTheme();
  systemPrefersLight.addEventListener('change', applyTheme);
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) changePreference(readStoredPreference());
  });
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getPreference = () => preference;

export const useThemePreference = () => useSyncExternalStore(subscribe, getPreference);

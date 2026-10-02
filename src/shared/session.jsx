import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import apiClient from '../apiClient';

const ANONYMOUS = { status: 'anonymous', user: null, tabs: [], error: null };
const LOADING = { status: 'loading', user: null, tabs: [], error: null };

const SessionContext = createContext({ ...ANONYMOUS, hasTab: () => false, reload: () => {} });

export const SessionProvider = ({ children }) => {
  const token = useSyncExternalStore(apiClient.subscribeToken, apiClient.getToken);
  const live = Boolean(token) && apiClient.hasLiveToken();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState({ token: null, attempt: -1, ...LOADING });

  useEffect(() => {
    if (!live) return undefined;
    let cancelled = false;
    apiClient.api
      .me()
      .then((res) => {
        if (cancelled) return;
        const { tabs, ...user } = res.data;
        setLoaded({ token, attempt, status: 'ready', user, tabs: tabs || [], error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        if (error.response?.status === 401) {
          apiClient.clearToken();
          return;
        }
        setLoaded({ token, attempt, status: 'error', user: null, tabs: [], error });
      });
    return () => {
      cancelled = true;
    };
  }, [token, live, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const current = !live
    ? ANONYMOUS
    : loaded.token === token && loaded.attempt === attempt
      ? loaded
      : LOADING;

  const value = useMemo(
    () => ({
      status: current.status,
      user: current.user,
      tabs: current.tabs,
      error: current.error,
      hasTab: (key) => current.tabs.some((tab) => tab.key === key),
      reload,
    }),
    [current, reload]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => useContext(SessionContext);

import { useEffect, useState } from 'react';

export const useRequest = (enabled, loader) => {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    loader()
      .then((res) => {
        if (!cancelled) setState({ data: res.data, error: null, loading: false });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, error: err, loading: false });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, loader]);

  return state;
};

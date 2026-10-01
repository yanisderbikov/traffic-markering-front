import { useEffect, useState } from 'react';
import apiClient from '../apiClient';
import { errorMessage } from './auth';

const REFRESH_MS = 60_000;

let cached = null;
let cachedAt = 0;
let inflight = null;

const fetchRate = () => {
  if (cached && Date.now() - cachedAt < REFRESH_MS) return Promise.resolve(cached);
  if (!inflight) {
    inflight = apiClient.api
      .usdt()
      .then((res) => {
        cached = res.data;
        cachedAt = Date.now();
        return cached;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

const useUsdtRate = () => {
  const [rate, setRate] = useState(cached);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetchRate()
        .then((next) => {
          if (!alive) return;
          setRate(next);
          setError('');
        })
        .catch((err) => {
          if (alive) setError(errorMessage(err, 'Курс USDT временно недоступен'));
        });
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return { rate, error };
};

export default useUsdtRate;

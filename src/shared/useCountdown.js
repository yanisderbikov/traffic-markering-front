import { useEffect, useState } from 'react';

const useCountdown = (deadline) => {
  const target = deadline ? new Date(deadline).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (target == null) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => {
      const next = Date.now();
      setNow(next);
      if (next >= target) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  return target == null ? null : Math.max(0, target - now);
};

export const formatCountdown = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default useCountdown;

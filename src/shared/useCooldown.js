import { useEffect, useState } from 'react';

export const RESEND_COOLDOWN_SECONDS = 30;

export const useCooldown = () => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const start = (seconds = RESEND_COOLDOWN_SECONDS) => setSecondsLeft(seconds);

  return { secondsLeft, start, active: secondsLeft > 0 };
};

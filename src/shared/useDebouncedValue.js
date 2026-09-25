import { useEffect, useState } from 'react';

export const useDebouncedValue = (value, delayMs) => {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
};

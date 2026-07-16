import { useState, useEffect } from "react";

const PREFIX = "poupe_rl_";

export function useRateLimit(key: string, cooldownSeconds: number) {
  const storageKey = PREFIX + key;

  const getSecondsLeft = () => {
    const ts = localStorage.getItem(storageKey);
    if (!ts) return 0;
    const elapsed = (Date.now() - Number(ts)) / 1000;
    return Math.max(0, Math.ceil(cooldownSeconds - elapsed));
  };

  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      const left = getSecondsLeft();
      setSecondsLeft(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft > 0]);

  const markSubmitted = () => {
    localStorage.setItem(storageKey, String(Date.now()));
    setSecondsLeft(cooldownSeconds);
  };

  return { blocked: secondsLeft > 0, secondsLeft, markSubmitted };
}

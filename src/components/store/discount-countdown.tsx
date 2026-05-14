'use client';

import { useEffect, useState } from "react";

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export function DiscountCountdown({ endAt }: { endAt: string | Date }) {
  const endTimestamp = new Date(endAt).getTime();
  const [timeLeft, setTimeLeft] = useState(() => endTimestamp - Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(endTimestamp - Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [endTimestamp]);

  if (timeLeft <= 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-[rgba(214,47,85,0.18)] bg-[rgba(214,47,85,0.07)] px-4 py-3 text-sm font-semibold text-[var(--danger-500)]">
      Discount ends in {formatCountdown(timeLeft)}
    </div>
  );
}

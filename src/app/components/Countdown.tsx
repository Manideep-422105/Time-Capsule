"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

// NEW PROP: onFinish
export default function Countdown({ targetDate, onFinish }: { targetDate: string, onFinish: () => void }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else {
        // TIME IS UP!
        onFinish(); // Notify parent
        return "Unlocked";
      }
    };

    setTimeLeft(calculateTime());
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onFinish]);

  if (timeLeft === "Unlocked") return null;

  return (
    <div className="font-mono text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded border border-blue-500/30 flex items-center gap-1 animate-pulse">
      <Clock className="w-3 h-3" />
      {timeLeft}
    </div>
  );
}
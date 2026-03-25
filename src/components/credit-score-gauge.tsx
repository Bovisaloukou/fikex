"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CreditScoreGaugeProps {
  score: number; // 0-100
  size?: number;
}

function getScoreInfo(score: number) {
  if (score <= 30) return { label: "Non éligible", color: "#ef4444", bg: "bg-red-50", text: "text-red-600" };
  if (score <= 60) return { label: "En progression", color: "#f59e0b", bg: "bg-amber-50", text: "text-amber-600" };
  if (score <= 80) return { label: "Éligible", color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-600" };
  return { label: "Excellent", color: "#059669", bg: "bg-emerald-50", text: "text-emerald-700" };
}

export function CreditScoreGauge({ score, size = 200 }: CreditScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const info = getScoreInfo(score);

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  // SVG arc calculations
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // We use a 270-degree arc (3/4 of circle) for the gauge
  const arcLength = circumference * 0.75;
  const filledLength = (animatedScore / 100) * arcLength;

  // Rotation to start from bottom-left
  const startAngle = 135;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
          />
          {/* Filled arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={info.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${circumference - filledLength}`}
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
            className="transition-all duration-100"
            style={{
              filter: `drop-shadow(0 0 8px ${info.color}40)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold tabular-nums text-gray-900"
            style={{ color: info.color }}
          >
            {animatedScore}
          </span>
          <span className="text-xs text-gray-500 mt-0.5">sur 100</span>
        </div>
      </div>

      {/* Label */}
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-1.5",
          info.bg
        )}
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: info.color }}
        />
        <span className={cn("text-sm font-semibold", info.text)}>
          {info.label}
        </span>
      </div>
    </div>
  );
}

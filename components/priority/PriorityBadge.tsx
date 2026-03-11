"use client";

import { Zap, Minus, Circle } from "lucide-react";

export type PriorityValue = "LOW" | "MEDIUM" | "HIGH";

const PRIORITY_CONFIG: Record<
  PriorityValue,
  { label: string; Icon: typeof Zap; iconSize: { sm: number; md: number }; className: string }
> = {
  HIGH: {
    label: "Высокий",
    Icon: Zap,
    iconSize: { sm: 12, md: 14 },
    className:
      "text-red-400 bg-red-500/10 border-red-500/20"
  },
  MEDIUM: {
    label: "Средний",
    Icon: Minus,
    iconSize: { sm: 12, md: 14 },
    className:
      "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
  LOW: {
    label: "Низкий",
    Icon: Circle,
    iconSize: { sm: 12, md: 14 },
    className:
      "text-zinc-400 bg-zinc-500/10 border-zinc-500/20"
  }
};

type Props = {
  priority: PriorityValue | string;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
};

export function PriorityBadge({
  priority,
  size = "sm",
  showLabel = false,
  className = ""
}: Props) {
  const key = (priority === "LOW" || priority === "MEDIUM" || priority === "HIGH"
    ? priority
    : "MEDIUM") as PriorityValue;
  const config = PRIORITY_CONFIG[key];
  const { Icon, label, iconSize } = config;
  const px = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${config.className} ${px} ${className}`}
      title={label}
    >
      <Icon
        className="shrink-0"
        size={iconSize[size]}
        strokeWidth={2.5}
        aria-hidden
      />
      {showLabel && <span className={textSize}>{label}</span>}
    </span>
  );
}

"use client";

import { ActivityItem, type ActivityItemType } from "./ActivityItem";

type Props = {
  activities: ActivityItemType[];
  emptyMessage?: string;
  compact?: boolean;
  className?: string;
};

export function ActivityFeed({
  activities,
  emptyMessage = "Пока нет активности",
  compact = false,
  className = ""
}: Props) {
  if (activities.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--asana-text-placeholder)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul
      className={`divide-y divide-[var(--asana-border-subtle)] ${className}`}
      role="list"
      aria-label="История активности"
    >
      {activities.map((activity) => (
        <li key={activity.id}>
          <ActivityItem activity={activity} compact={compact} />
        </li>
      ))}
    </ul>
  );
}

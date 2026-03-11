"use client";

import Link from "next/link";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import type { ActivityItemType } from "@/components/activity/ActivityItem";

type ActivityPreviewItem = {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    avatarEmoji: string | null;
  };
  task: { id: string; title: string } | null;
  projectId: string;
};

type Props = {
  activities: ActivityPreviewItem[];
};

function toActivityItemType(a: ActivityPreviewItem): ActivityItemType {
  return {
    id: a.id,
    message: a.message,
    createdAt: a.createdAt,
    user: a.user,
    task: a.task
  };
}

export function RecentActivityPreview({ activities }: Props) {
  const items = activities.map(toActivityItemType);

  return (
    <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--asana-border-subtle)] px-5 py-3">
        <h3 className="text-sm font-medium text-[var(--asana-text-secondary)]">
          Недавняя активность
        </h3>
        {activities.length > 0 && (
          <Link
            href="/"
            className="text-xs font-medium text-[var(--asana-blue)] hover:underline"
          >
            Все проекты
          </Link>
        )}
      </div>
      <ActivityFeed
        activities={items}
        emptyMessage="Пока нет активности"
        compact
        className="max-h-[320px] overflow-y-auto"
      />
    </div>
  );
}

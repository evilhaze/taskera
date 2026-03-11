"use client";

import { UserAvatar } from "@/components/avatar/UserAvatar";
import { getRelativeTime } from "@/lib/utils/relativeTime";

export type ActivityItemType = {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl?: string | null;
    avatarEmoji?: string | null;
  };
  task?: { id: string; title: string } | null;
};

type Props = {
  activity: ActivityItemType;
  compact?: boolean;
};

export function ActivityItem({ activity, compact = false }: Props) {
  const displayName = activity.user.name ?? activity.user.email;
  const time = getRelativeTime(activity.createdAt);

  return (
    <div
      className={`flex gap-3 ${compact ? "py-2" : "py-3"}`}
      role="listitem"
    >
      <UserAvatar
        user={activity.user}
        size={compact ? "xs" : "sm"}
        className="shrink-0"
        title={displayName}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--asana-text-primary)]">
          {activity.message}
        </p>
        <p
          className={`text-[var(--asana-text-placeholder)] ${compact ? "text-[10px] mt-0.5" : "text-xs mt-1"}`}
          title={new Date(activity.createdAt).toLocaleString("ru-RU")}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

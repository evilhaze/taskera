"use client";

import { useState, useEffect } from "react";
import { ActivityFeed } from "./ActivityFeed";
import type { ActivityItemType } from "./ActivityItem";

type Props = {
  projectId: string;
  className?: string;
};

export function RecentActivitySection({ projectId, className = "" }: Props) {
  const [activities, setActivities] = useState<ActivityItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/activity`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setActivities(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <section className={className}>
      <h2 className="section-title mb-4">Недавняя активность</h2>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
          </div>
        ) : (
          <ActivityFeed
            activities={activities}
            emptyMessage="Пока нет активности в проекте"
          />
        )}
      </div>
    </section>
  );
}

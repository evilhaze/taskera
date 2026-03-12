"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { AIAssistantPanel } from "./AIAssistantPanel";

type Props = { aiEnabled?: boolean };

export function AIAssistantTrigger({ aiEnabled: aiEnabledProp }: Props = {}) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(aiEnabledProp ?? false);

  useEffect(() => {
    if (aiEnabledProp !== undefined) {
      setAvailable(aiEnabledProp);
      return;
    }
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { enabled?: boolean; available?: boolean }) =>
        setAvailable(data.enabled === true || data.available === true)
      )
      .catch(() => setAvailable(false));
  }, [aiEnabledProp]);

  if (!available) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] px-3 text-sm font-medium text-[var(--asana-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--asana-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--asana-border)] focus:ring-offset-1 focus:ring-offset-[var(--asana-bg-app)]"
        aria-label="Открыть AI Assistant"
      >
        <Sparkles className="h-4 w-4 text-[var(--asana-blue)]" aria-hidden />
        AI Assistant
      </button>
      <AIAssistantPanel
        open={open}
        onClose={() => setOpen(false)}
        onTaskCreated={() => setOpen(false)}
        onTaskUpdated={() => setOpen(false)}
      />
    </>
  );
}

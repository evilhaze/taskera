"use client";

import { useState, useEffect } from "react";
import { Sparkles, Lock } from "lucide-react";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { openUpsellModal } from "@/components/demo/UpsellModal";

type Props = { aiEnabled?: boolean; isDemo?: boolean };

export function AIAssistantTrigger({ aiEnabled: aiEnabledProp, isDemo }: Props = {}) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(aiEnabledProp ?? false);

  useEffect(() => {
    if (aiEnabledProp !== undefined) {
      setAvailable(aiEnabledProp);
      return;
    }
    if (isDemo) {
      setAvailable(false);
      return;
    }
    fetch("/api/ai/status")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { enabled?: boolean; available?: boolean }) =>
        setAvailable(data.enabled === true || data.available === true)
      )
      .catch(() => setAvailable(false));
  }, [aiEnabledProp, isDemo]);

  if (isDemo) {
    return (
      <button
        type="button"
        onClick={openUpsellModal}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)]/50 px-3 text-sm font-medium text-[var(--asana-text-placeholder)] transition-colors hover:bg-[var(--asana-bg-input)] hover:text-[var(--asana-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--asana-border)] focus:ring-offset-1 focus:ring-offset-[var(--asana-bg-app)]"
        aria-label="AI Assistant доступен в Plus"
        title="AI Assistant доступен в подписке Plus"
      >
        <Lock className="h-4 w-4 shrink-0" aria-hidden />
        <span>AI Assistant</span>
        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
          Plus
        </span>
      </button>
    );
  }

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

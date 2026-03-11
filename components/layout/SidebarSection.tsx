"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

export function SidebarSection({ title, defaultOpen = true, children }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-[var(--asana-text-placeholder)] transition-colors hover:bg-white/5 hover:text-[var(--asana-text-secondary)]"
        aria-expanded={isOpen}
        aria-controls={`sidebar-section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        id={`sidebar-section-${title.replace(/\s+/g, "-").toLowerCase()}-trigger`}
      >
        <span>{title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        />
      </button>
      {isOpen && (
        <div
          id={`sidebar-section-${title.replace(/\s+/g, "-").toLowerCase()}`}
          role="region"
          aria-labelledby={`sidebar-section-${title.replace(/\s+/g, "-").toLowerCase()}-trigger`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

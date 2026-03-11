"use client";

export type LabelShape = { id: string; name: string; color: string };

const COLOR_VAR_MAP: Record<string, { bg: string; text: string }> = {
  gray: { bg: "var(--label-gray-bg)", text: "var(--label-gray-text)" },
  blue: { bg: "var(--label-blue-bg)", text: "var(--label-blue-text)" },
  green: { bg: "var(--label-green-bg)", text: "var(--label-green-text)" },
  yellow: { bg: "var(--label-yellow-bg)", text: "var(--label-yellow-text)" },
  orange: { bg: "var(--label-orange-bg)", text: "var(--label-orange-text)" },
  red: { bg: "var(--label-red-bg)", text: "var(--label-red-text)" },
  purple: { bg: "var(--label-purple-bg)", text: "var(--label-purple-text)" },
  pink: { bg: "var(--label-pink-bg)", text: "var(--label-pink-text)" }
};

function getStyles(color: string) {
  return COLOR_VAR_MAP[color] ?? COLOR_VAR_MAP.gray;
}

type Props = {
  label: LabelShape;
  small?: boolean;
  onRemove?: () => void;
  className?: string;
};

export function LabelBadge({ label, small, onRemove, className = "" }: Props) {
  const { bg, text } = getStyles(label.color);
  const base =
    "inline-flex items-center gap-1 rounded-md border border-transparent font-medium transition-colors";
  const size = small
    ? "px-1.5 py-0.5 text-[10px]"
    : "px-2 py-1 text-xs";
  const clickable = onRemove ? "cursor-pointer hover:opacity-80" : "";

  const style = { backgroundColor: bg, color: text } as React.CSSProperties;

  const content = (
    <>
      <span className="truncate max-w-[120px]" title={label.name}>
        {label.name}
      </span>
      {onRemove && (
        <span
          className="shrink-0 rounded p-0.5 hover:bg-black/10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          role="button"
          aria-label={`Удалить метку ${label.name}`}
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      )}
    </>
  );

  if (onRemove) {
    return (
      <span
        style={style}
        className={`${base} ${size} ${clickable} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </span>
    );
  }

  return (
    <span style={style} className={`${base} ${size} ${className}`}>
      {content}
    </span>
  );
}

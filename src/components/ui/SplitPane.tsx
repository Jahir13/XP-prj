import type { ReactNode } from 'react';

interface SplitPaneProps {
  left: ReactNode;
  right: ReactNode;
  defaultRatio?: number;
}

export default function SplitPane({ left, right, defaultRatio = 60 }: SplitPaneProps) {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[var(--split-ratio)_1fr] gap-6"
      style={{ '--split-ratio': `${defaultRatio}%` } as React.CSSProperties}
    >
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

import type { ReactNode } from 'react';
import Breadcrumb from './Breadcrumb';

interface PageShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  children: ReactNode;
}

export default function PageShell({ title, subtitle, breadcrumbs, actions, children }: PageShellProps) {
  return (
    <div>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
          {subtitle && <p className="text-xs text-zinc-500 font-mono mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

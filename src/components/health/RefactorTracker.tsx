import { useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeLogs, updateLogStatus } from '../../store/logs';

interface DebtItem {
  id: string;
  title: string;
  type: 'debt' | 'refactor';
  date: string;
  status: 'Open' | 'Resolved';
  relatedStory?: string;
  participants?: string[];
}

export default function RefactorTracker({ debtItems: initialItems }: { debtItems: DebtItem[] }) {
  const runtimeLogs = useStore($runtimeLogs);

  const items = useMemo(() => {
    if (typeof window === 'undefined' || runtimeLogs.length === 0) {
      return initialItems;
    }
    return runtimeLogs;
  }, [runtimeLogs, initialItems]);

  const toggleStatus = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      const nextStatus = item.status === 'Open' ? 'Resolved' : 'Open';
      updateLogStatus(id, nextStatus);
    }
  };

  const openItems = items.filter((i) => i.status === 'Open');

  return (
    <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-zinc-300">Refactor & Debt Register</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {openItems.length} open
          </span>
        </div>
      </div>

      <div className="divide-y divide-zinc-800/50">
        {items.map((item) => (
          <div
            key={item.id}
            className="px-5 py-3 flex items-center justify-between hover:bg-zinc-800/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleStatus(item.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                  item.status === 'Resolved'
                    ? 'bg-emerald-500/20 border-emerald-500/40'
                    : 'border-zinc-600 hover:border-zinc-500'
                }`}
              >
                {item.status === 'Resolved' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-emerald-400"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </button>
              <div>
                <span
                  className={`text-sm font-medium ${item.status === 'Resolved' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}
                >
                  {item.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      item.type === 'debt' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {item.type}
                  </span>
                  {item.relatedStory && (
                    <span className="text-[10px] font-mono text-zinc-600">→ {item.relatedStory}</span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-600">{new Date(item.date).toLocaleDateString()}</span>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-zinc-500">🎉 No technical debt recorded</div>
      )}
    </div>
  );
}

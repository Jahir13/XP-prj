interface LiveBuildIndicatorProps {
  status: 'success' | 'failed' | 'running' | 'pending' | 'idle';
  onTrigger?: () => void;
}

const config: Record<string, { color: string; label: string; pulse: boolean }> = {
  success: { color: 'bg-emerald-400', label: 'Build passing', pulse: false },
  failed: { color: 'bg-rose-400', label: 'Build failing', pulse: false },
  running: { color: 'bg-amber-400', label: 'Build running', pulse: true },
  pending: { color: 'bg-zinc-500', label: 'Build queued', pulse: false },
  idle: { color: 'bg-zinc-700', label: 'No recent build', pulse: false },
};

export default function LiveBuildIndicator({ status, onTrigger }: LiveBuildIndicatorProps) {
  const c = config[status] || config.idle;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
      <span className={`w-2 h-2 rounded-full ${c.color} ${c.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-[10px] font-mono text-zinc-400">{c.label}</span>
      {onTrigger && (
        <button
          onClick={onTrigger}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono ml-1 cursor-pointer"
        >
          Trigger
        </button>
      )}
    </div>
  );
}

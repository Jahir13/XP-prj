import { useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories } from '../../store/stories';
import { $sessionHistory } from '../../store/pairSession';

interface StoryMetric {
  id: string;
  points: number;
  status: string;
  assignedPair: string[];
  isTDD: boolean;
}

interface Props {
  stories: StoryMetric[];
  totalPairMinutes: number;
}

function CircularGauge({
  value,
  max,
  label,
  color,
  icon,
}: {
  value: number;
  max: number;
  label: string;
  color: string;
  icon: string;
}) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const colorMap: Record<string, { stroke: string; text: string; bg: string }> = {
    indigo: { stroke: '#6366f1', text: 'text-indigo-400', bg: 'bg-indigo-500/5' },
    emerald: { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/5' },
    amber: { stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/5' },
    sky: { stroke: '#38bdf8', text: 'text-sky-400', bg: 'bg-sky-500/5' },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className={`flex flex-col items-center p-5 rounded-xl ${c.bg} border border-zinc-800/50`}>
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#27272a" strokeWidth="6" />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={c.stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg">{icon}</span>
          <span className={`text-lg font-bold font-mono ${c.text}`}>{pct}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-zinc-400">{label}</span>
      <span className="text-[10px] font-mono text-zinc-600 mt-0.5">
        {value}/{max}
      </span>
    </div>
  );
}

export default function XPHealthGauges({ stories: initialStories, totalPairMinutes: initialPairMinutes }: Props) {
  const runtimeStories = useStore($runtimeStories);
  const sessionHistory = useStore($sessionHistory);

  // Merge runtime stories
  const stories = useMemo(() => {
    if (typeof window === 'undefined' || runtimeStories.length === 0) {
      return initialStories;
    }
    return runtimeStories;
  }, [runtimeStories, initialStories]);

  // Merge runtime pairing sessions
  const totalPairMinutes = useMemo(() => {
    if (typeof window === 'undefined') {
      return initialPairMinutes;
    }
    const sessionMinutes = sessionHistory.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    return initialPairMinutes + sessionMinutes;
  }, [sessionHistory, initialPairMinutes]);

  const total = stories.length;
  const doneStories = stories.filter((s) => s.status === 'Done');
  const pairingStories = stories.filter((s) => s.assignedPair && s.assignedPair.length >= 2).length;
  const tddStories = stories.filter((s) => s.isTDD).length;
  const totalPairHours = Math.round((totalPairMinutes / 60) * 10) / 10;
  const donePoints = doneStories.reduce((sum, s) => sum + s.points, 0);
  const totalPoints = stories.reduce((sum, s) => sum + s.points, 0);

  return (
    <div className="grid grid-cols-4 gap-4">
      <CircularGauge value={donePoints} max={totalPoints} label="Story Completion" color="indigo" icon="📊" />
      <CircularGauge value={pairingStories} max={total} label="Pairing Coverage" color="amber" icon="👥" />
      <CircularGauge value={tddStories} max={total} label="TDD Rate" color="emerald" icon="✅" />
      <CircularGauge value={totalPairHours} max={40} label="Sustainable Pace" color="sky" icon="⏱" />
    </div>
  );
}

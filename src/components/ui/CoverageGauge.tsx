interface CoverageGaugeProps {
  label: string;
  percentage: number;
  color?: string;
}

export default function CoverageGauge({ label, percentage, color: _color = '#6366f1' }: CoverageGaugeProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const statusColor = percentage > 80 ? '#10b981' : percentage > 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="#27272a" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={statusColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-mono" style={{ color: statusColor }}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <span className="text-[10px] text-zinc-500 mt-1">{label}</span>
    </div>
  );
}

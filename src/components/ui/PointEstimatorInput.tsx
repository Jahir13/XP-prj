interface PointEstimatorInputProps {
  value: number;
  onChange: (points: number) => void;
  disabled?: boolean;
}

const FIBONACCI = [0, 1, 2, 3, 5, 8, 13, 21];

export default function PointEstimatorInput({ value, onChange, disabled }: PointEstimatorInputProps) {
  return (
    <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5">
      {FIBONACCI.map((p) => (
        <button
          key={p}
          type="button"
          disabled={disabled}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-md font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
            value === p
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={`${p} story points`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

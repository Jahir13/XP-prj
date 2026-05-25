interface LoadingSkeletonProps {
  variant?: 'card' | 'row' | 'chart' | 'text';
  count?: number;
}

const variants = {
  card: 'h-32 rounded-xl',
  row: 'h-12 rounded-lg',
  chart: 'h-64 rounded-xl',
  text: 'h-4 rounded',
};

export default function LoadingSkeleton({ variant = 'text', count = 3 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`bg-zinc-800/50 ${variants[variant]}`} />
      ))}
    </div>
  );
}

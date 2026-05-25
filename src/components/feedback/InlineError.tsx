interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export default function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
      role="alert"
    >
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold underline hover:no-underline cursor-pointer whitespace-nowrap"
        >
          Retry
        </button>
      )}
    </div>
  );
}

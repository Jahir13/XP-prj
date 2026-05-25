interface AlertBannerProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  message: string;
  action?: { label: string; onClick: () => void };
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variants = {
  info: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  error: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
};

export default function AlertBanner({ variant = 'info', message, action, dismissible, onDismiss }: AlertBannerProps) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm ${variants[variant]}`}
      role="alert"
    >
      <span>{message}</span>
      <div className="flex items-center gap-2">
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-semibold underline hover:no-underline cursor-pointer"
          >
            {action.label}
          </button>
        )}
        {dismissible && onDismiss && (
          <button onClick={onDismiss} className="text-current opacity-60 hover:opacity-100 cursor-pointer text-xs">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

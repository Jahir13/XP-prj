import { useStore } from '@nanostores/react';
import { $wsStatus } from '../../websocket/client';
import type { WsConnectionState } from '../../websocket/client';

const statusConfig: Record<WsConnectionState, { color: string; label: string; pulse: boolean }> = {
  connected: { color: 'bg-emerald-400', label: 'Connected', pulse: false },
  connecting: { color: 'bg-amber-400', label: 'Connecting', pulse: true },
  reconnecting: { color: 'bg-amber-400', label: 'Reconnecting', pulse: true },
  disconnected: { color: 'bg-zinc-500', label: 'Disconnected', pulse: false },
};

export default function WebSocketStatusDot() {
  const status = useStore($wsStatus);
  const config = statusConfig[status];

  return (
    <div
      className="flex items-center gap-1.5"
      title={`WebSocket: ${config.label}`}
      role="status"
      aria-label={`WebSocket ${config.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-[10px] text-zinc-600 font-mono hidden sm:inline">{config.label}</span>
    </div>
  );
}

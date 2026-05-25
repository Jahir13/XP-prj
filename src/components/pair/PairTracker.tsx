import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import {
  $pairSession,
  startSession,
  stopSession,
  swapRoles,
  tickSession,
  exportSessionToMarkdown,
  $sessionHistory,
  type PairSessionLog,
} from '../../store/pairSession';

const TEAM_MEMBERS = [
  'Christian Puchaicela',
  'Ariel Rosas',
  'Jahir Rocha',
  'Kevin Palacios',
  'Jhonathan Pulig',
  'Santiago Pinta',
];

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

interface PairTrackerProps {
  teamMembers?: string[];
}

export default function PairTracker({ teamMembers = TEAM_MEMBERS }: PairTrackerProps) {
  const session = useStore($pairSession);
  const history = useStore($sessionHistory);
  const [isExpanded, setIsExpanded] = useState(false);
  const [driver, setDriver] = useState(teamMembers[3] || TEAM_MEMBERS[3]); // Kevin Palacios
  const [navigator, setNavigator] = useState(teamMembers[0] || TEAM_MEMBERS[0]); // Christian Puchaicela

  // Tick timer
  useEffect(() => {
    if (!session.isActive) return;
    const interval = setInterval(() => tickSession(), 1000);
    return () => clearInterval(interval);
  }, [session.isActive]);

  const handleStart = () => {
    startSession(driver, navigator);
  };

  const handleStop = () => {
    stopSession();
  };

  const handleSwap = () => {
    swapRoles();
  };

  const handleExport = (log: PairSessionLog) => {
    const md = exportSessionToMarkdown(log);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pair-session-${log.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Minimized pill
  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-[slide-up_0.3s_ease-out]">
        <button
          onClick={() => setIsExpanded(true)}
          aria-label={session.isActive ? 'Ver sesión activa de programación en pareja' : 'Abrir rastreador de parejas'}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-full border backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 ${
            session.isActive
              ? 'bg-indigo-500/10 border-indigo-500/30 shadow-indigo-500/10'
              : 'bg-zinc-900/90 border-zinc-700/50 hover:border-zinc-600'
          }`}
        >
          {session.isActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-medium text-zinc-300">
                {session.driver.split(' ')[0]} ↔ {session.navigator.split(' ')[0]}
              </span>
              <span
                className="text-sm font-mono font-bold text-indigo-400"
                style={{ animation: 'timer-tick 1s infinite' }}
              >
                {formatTime(session.elapsedSeconds)}
              </span>
            </>
          ) : (
            <>
              <span className="text-sm">👥</span>
              <span className="text-xs font-medium text-zinc-400">Emparejar</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Expanded panel
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 animate-[slide-up_0.3s_ease-out]">
      <div className="rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 shadow-2xl shadow-black/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
          <div className="flex items-center gap-2">
            <span className="text-sm">👥</span>
            <span className="text-sm font-semibold text-zinc-200">Rastreador de Parejas</span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            aria-label="Cerrar rastreador de parejas"
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Timer Display */}
        {session.isActive && (
          <div className="px-4 py-4 text-center border-b border-zinc-800/50 bg-indigo-500/5">
            <div className="text-3xl font-mono font-bold text-indigo-400 mb-2">
              {formatTime(session.elapsedSeconds)}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-xs font-mono">
                🎮 {session.driver.split(' ')[0]}
              </span>
              <span className="text-zinc-500">↔</span>
              <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 text-xs font-mono">
                🧭 {session.navigator.split(' ')[0]}
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-4">
          {!session.isActive ? (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="pair-driver"
                  className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                >
                  Conductor
                </label>
                <select
                  id="pair-driver"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  {teamMembers.map((m) => (
                    <option key={m} value={m} disabled={m === navigator}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="pair-navigator"
                  className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                >
                  Navegador
                </label>
                <select
                  id="pair-navigator"
                  value={navigator}
                  onChange={(e) => setNavigator(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                >
                  {teamMembers.map((m) => (
                    <option key={m} value={m} disabled={m === driver}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleStart}
                className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Iniciar Emparejamiento
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleSwap}
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium border border-zinc-700 transition-all cursor-pointer"
              >
                🔄 Intercambiar Roles
              </button>
              <button
                onClick={handleStop}
                className="w-full py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium border border-rose-500/20 transition-all cursor-pointer"
              >
                ⏹ Detener Sesión
              </button>
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        {history.length > 0 && (
          <div className="border-t border-zinc-800/50">
            <div className="px-4 py-2">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Recientes</span>
            </div>
            <div className="px-4 pb-3 space-y-1 max-h-32 overflow-y-auto">
              {history
                .slice(-3)
                .reverse()
                .map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-1.5 text-xs">
                    <span className="text-zinc-400">
                      {log.driver.split(' ')[0]} & {log.navigator.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-zinc-500">{log.durationMinutes}m</span>
                      <button
                        onClick={() => handleExport(log)}
                        className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        title="Exportar a Markdown"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

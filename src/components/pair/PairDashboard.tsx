import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import {
  $pairSession,
  $sessionHistory,
  startSession,
  stopSession,
  swapRoles,
  tickSession,
  exportSessionToMarkdown,
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

export default function PairDashboard() {
  const session = useStore($pairSession);
  const history = useStore($sessionHistory);
  const [driver, setDriver] = useState(TEAM_MEMBERS[3]); // Default Kevin Palacios (Programador)
  const [navigator, setNavigator] = useState(TEAM_MEMBERS[0]); // Default Christian Puchaicela (Coach)

  // Tick active timer
  useEffect(() => {
    if (!session.isActive) return;
    const interval = setInterval(() => tickSession(), 1000);
    return () => clearInterval(interval);
  }, [session.isActive]);

  const formatTime = useCallback((seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  const handleStart = () => {
    if (driver === navigator) return;
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

  // 1. Calculate Pairing Matrix counts
  const matrixData = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};

    // Initialize
    TEAM_MEMBERS.forEach((m1) => {
      counts[m1] = {};
      TEAM_MEMBERS.forEach((m2) => {
        counts[m1][m2] = 0;
      });
    });

    // Populate from history
    history.forEach((log) => {
      const p1 = log.driver;
      const p2 = log.navigator;
      if (counts[p1] && counts[p2]) {
        counts[p1][p2] += 1;
        counts[p2][p1] += 1; // Symmetric matrix
      }
    });

    return counts;
  }, [history]);

  // 2. Identify rotation recommendations (pairs with 0 sessions)
  const rotationSuggestions = useMemo(() => {
    const suggestions: { p1: string; p2: string; reason: string }[] = [];

    // Find all combinations with 0 sessions
    for (let i = 0; i < TEAM_MEMBERS.length; i++) {
      for (let j = i + 1; j < TEAM_MEMBERS.length; j++) {
        const p1 = TEAM_MEMBERS[i];
        const p2 = TEAM_MEMBERS[j];
        if (matrixData[p1][p2] === 0) {
          // Check roles to suggest a logical pairing
          let reason = 'Compartir conocimiento general de dominio.';
          if (p1.includes('Jhonathan') || p2.includes('Jhonathan')) {
            reason = 'Emparejar programador con tester para establecer criterios de aceptación.';
          } else if (p1.includes('Christian') || p2.includes('Christian')) {
            reason = 'Emparejar coach con miembro para revisar los principios de programación extrema.';
          } else if (p1.includes('Ariel') || p2.includes('Ariel') || p1.includes('Jahir') || p2.includes('Jahir')) {
            reason = 'Emparejar cliente/gestor con programador para la aclaración directa de requerimientos.';
          }
          suggestions.push({ p1, p2, reason });
        }
      }
    }

    return suggestions.slice(0, 3); // Top 3 recommendations
  }, [matrixData]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Centro de Rotación de Parejas</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Práctica XP: Programación en Pareja y Propiedad Colectiva
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-400">
          Historial Total: <span className="text-indigo-400 font-bold">{history.length} sesiones</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Session Console */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-5">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              Consola de Sesión en Pareja
            </h3>

            {session.isActive ? (
              <div className="text-center py-6 bg-indigo-500/5 rounded-xl border border-indigo-500/10 space-y-4">
                <div className="text-4xl font-mono font-bold text-indigo-400 animate-pulse">
                  {formatTime(session.elapsedSeconds)}
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono text-zinc-400">
                    <span className="text-zinc-500">Conductor:</span>{' '}
                    <strong className="text-zinc-200">{session.driver}</strong>
                  </div>
                  <div className="text-xs font-mono text-zinc-400">
                    <span className="text-zinc-500">Navegador:</span>{' '}
                    <strong className="text-zinc-200">{session.navigator}</strong>
                  </div>
                </div>

                <div className="px-4 flex gap-2">
                  <button
                    onClick={handleSwap}
                    className="flex-1 py-2 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                  >
                    🔄 Intercambiar Roles
                  </button>
                  <button
                    onClick={handleStop}
                    className="flex-1 py-2 text-xs font-medium rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 transition-colors cursor-pointer"
                  >
                    ⏹ Detener Sesión
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="dashboard-driver"
                      className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                    >
                      Conductor (Escribe el código)
                    </label>
                    <select
                      id="dashboard-driver"
                      value={driver}
                      onChange={(e) => setDriver(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      {TEAM_MEMBERS.map((m) => (
                        <option key={m} value={m} disabled={m === navigator}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="dashboard-navigator"
                      className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium block mb-1.5"
                    >
                      Navegador (Revisa y guía)
                    </label>
                    <select
                      id="dashboard-navigator"
                      value={navigator}
                      onChange={(e) => setNavigator(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
                    >
                      {TEAM_MEMBERS.map((m) => (
                        <option key={m} value={m} disabled={m === driver}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  className="w-full py-2.5 text-xs font-semibold rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/10 transition-colors cursor-pointer"
                >
                  Iniciar Sesión en Pareja
                </button>
              </div>
            )}
          </div>

          {/* Silo recommendations */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">Recomendaciones de Rotación</h3>
            <div className="space-y-3">
              {rotationSuggestions.map((sug, i) => (
                <div key={i} className="p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400">
                      {sug.p1.split(' ')[0]} & {sug.p2.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-mono text-rose-400/80 bg-rose-500/5 px-1.5 py-0.5 rounded border border-rose-500/10">
                      Riesgo de Silo
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal">{sug.reason}</p>
                </div>
              ))}
              {rotationSuggestions.length === 0 && (
                <div className="text-center py-4 text-xs text-emerald-400 font-medium">
                  🎉 ¡Rotación Perfecta! Todos los miembros han programado juntos.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Matrix & Completed Sessions list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pair Matrix */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">Matriz de Rotación de Parejas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="py-2 text-[10px] uppercase font-mono tracking-wider text-zinc-500">Miembro</th>
                    {TEAM_MEMBERS.map((m) => (
                      <th key={m} className="py-2 text-center text-[10px] font-mono font-medium text-zinc-400">
                        {m.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {TEAM_MEMBERS.map((m1) => (
                    <tr key={m1} className="hover:bg-zinc-800/10 transition-colors">
                      <td className="py-3 text-xs font-semibold text-zinc-300 font-mono">{m1.split(' ')[0]}</td>
                      {TEAM_MEMBERS.map((m2) => {
                        const count = matrixData[m1][m2];
                        const isSelf = m1 === m2;

                        let cellStyle = 'bg-zinc-950/20 text-zinc-600';
                        if (isSelf) cellStyle = 'bg-zinc-950/60 text-transparent select-none cursor-not-allowed';
                        else if (count >= 3)
                          cellStyle = 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold';
                        else if (count > 0) cellStyle = 'bg-indigo-500/10 border border-indigo-500/15 text-indigo-300';

                        return (
                          <td key={m2} className="py-2.5 text-center">
                            <div
                              className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-all ${cellStyle}`}
                            >
                              {isSelf ? '—' : count}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-4 pt-1 text-[10px] text-zinc-500 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-zinc-950/20 border border-zinc-800" /> Sin emparejar
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500/10 border border-indigo-500/20" /> Emparejado
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/10 border border-emerald-500/20" /> Altamente Activo
                (3+)
              </div>
            </div>
          </div>

          {/* Completed Sessions Log */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">Registro de Sesiones Completadas</h3>
            <div className="divide-y divide-zinc-800/40 max-h-80 overflow-y-auto space-y-2 pr-1">
              {history
                .slice()
                .reverse()
                .map((log) => (
                  <div
                    key={log.id}
                    className="py-3 flex items-center justify-between hover:bg-zinc-800/10 transition-colors px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">👥</span>
                      <div>
                        <div className="text-xs font-medium text-zinc-200">
                          {log.driver} <span className="text-zinc-500 font-mono">programó con</span> {log.navigator}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                          {new Date(log.startTime).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-semibold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                        {log.durationMinutes} min{log.durationMinutes !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => handleExport(log)}
                        className="px-2.5 py-1 text-[10px] font-semibold font-mono rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                      >
                        Exportar MD
                      </button>
                    </div>
                  </div>
                ))}

              {history.length === 0 && (
                <div className="text-center py-8 text-xs text-zinc-500 italic">
                  Aún no se han registrado sesiones completadas. ¡Elige dos miembros del equipo e inicia sesión para
                  crear tu primer registro!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

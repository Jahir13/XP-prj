import { useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories } from '../../store/stories';
import { $sessionHistory } from '../../store/pairSession';
import { $runtimeLogs } from '../../store/logs';
import type { Story, Iteration } from '../../types';
import ErrorBoundary from '../ui/ErrorBoundary';

interface LogEntry {
  id: string;
  title: string;
  type: string;
  date: string;
  status: string;
  relatedStory?: string;
  participants?: string[];
  durationMinutes?: number;
}

interface Props {
  initialStories: Story[];
  initialIterations: Iteration[];
  initialLogs: LogEntry[];
  project: {
    metaphor: string;
    teamName: string;
    roles: { name: string; role: string }[];
  } | null;
}

const roleTranslations: Record<string, string> = {
  Coach: 'Coach (Entrenador)',
  Gestor: 'Gestor (Project Manager)',
  Cliente: 'Cliente',
  'Programmer/Tester': 'Programador / Tester',
  Tracker: 'Tracker (Rastreador)',
};

const statusTranslations: Record<string, string> = {
  Open: 'Abierto',
  Resolved: 'Resuelto',
};

const typeTranslations: Record<string, string> = {
  debt: 'Deuda',
  refactor: 'Refactor',
};

export default function DashboardStats({ initialStories, initialIterations, initialLogs, project }: Props) {
  // Binds to runtime stores
  const runtimeStories = useStore($runtimeStories);
  const sessionHistory = useStore($sessionHistory);
  const runtimeLogs = useStore($runtimeLogs);

  // 1. Stories Merged State
  const stories = useMemo(() => {
    if (typeof window === 'undefined' || runtimeStories.length === 0) {
      return initialStories;
    }
    return runtimeStories;
  }, [runtimeStories, initialStories]);

  // 2. Pair Sessions Merged State
  const pairSessions = useMemo(() => {
    const staticSessions = initialLogs.filter((l) => l.type === 'pair-session');
    if (typeof window === 'undefined') {
      return staticSessions;
    }

    // Map store sessions into the rendering format
    const formattedHistory: LogEntry[] = sessionHistory.map((s) => ({
      id: s.id,
      type: 'pair-session',
      title: `Programación en Pareja`,
      date: new Date(s.startTime).toISOString().split('T')[0],
      participants: [s.driver, s.navigator],
      durationMinutes: s.durationMinutes,
      status: 'Resolved',
    }));

    // Combine static and store sessions by unique identifier
    const localIds = new Set(formattedHistory.map((s) => s.id));
    const merged: LogEntry[] = [...formattedHistory];

    staticSessions.forEach((s, idx) => {
      const id = s.id || `static-session-${idx}`;
      if (!localIds.has(id)) {
        merged.push({ ...s, id });
      }
    });

    return merged;
  }, [sessionHistory, initialLogs]);

  // 3. Tech Debt & Refactors Merged State
  const logs = useMemo(() => {
    if (typeof window === 'undefined' || runtimeLogs.length === 0) {
      return initialLogs;
    }
    return runtimeLogs;
  }, [runtimeLogs, initialLogs]);

  const debtItems = useMemo(() => {
    return logs.filter((l) => l.type === 'debt' || l.type === 'refactor');
  }, [logs]);

  // Calculations
  const totalStories = stories.length;
  const doneStories = stories.filter((s) => s.status === 'Done').length;
  const currentStories = stories.filter((s) => s.status === 'Current').length;
  const donePoints = stories.filter((s) => s.status === 'Done').reduce((sum, s) => sum + s.points, 0);
  const currentIterationPoints = stories.filter((s) => s.status === 'Current').reduce((sum, s) => sum + s.points, 0);

  // Pairing Coverage
  const storiesWithPairs = stories.filter((s) => s.assignedPair && s.assignedPair.length >= 2).length;
  const pairingCoverage = totalStories > 0 ? Math.round((storiesWithPairs / totalStories) * 100) : 0;

  // TDD Rate
  const tddStories = stories.filter((s) => s.isTDD).length;
  const tddRate = totalStories > 0 ? Math.round((tddStories / totalStories) * 100) : 0;

  // Active Iteration Calculations
  const activeIteration = useMemo(() => {
    return initialIterations.find((i) => i.status === 'Active') || null;
  }, [initialIterations]);

  const completedIterations = useMemo(() => {
    return initialIterations.filter((i) => i.status === 'Completed').length;
  }, [initialIterations]);

  const velocity = completedIterations > 0 ? Math.round(donePoints / Math.max(completedIterations, 1)) : donePoints;

  // Pair hours
  const totalPairMinutes = pairSessions.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const totalPairHours = Math.round((totalPairMinutes / 60) * 10) / 10;

  // Open Debt count
  const openDebt = debtItems.filter((l) => l.status === 'Open').length;

  // Iteration Progress percentage
  const iterationProgress = useMemo(() => {
    if (!activeIteration) return 0;
    const start = new Date(activeIteration.startDate).getTime();
    const end = new Date(activeIteration.endDate).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  }, [activeIteration]);

  return (
    <ErrorBoundary>
      <div>
        {/* Active Iteration Card */}
        {activeIteration && (
          <div className="mb-8 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm font-semibold text-zinc-200">{activeIteration.name}</span>
                <span className="text-xs font-mono text-zinc-500">Iteración {activeIteration.number}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-zinc-500">
                  {donePoints + currentIterationPoints} / {activeIteration.capacity} pts
                </span>
                <span
                  className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                    donePoints + currentIterationPoints > activeIteration.capacity
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {donePoints + currentIterationPoints > activeIteration.capacity ? '⚠ SOBRE CAPACIDAD' : '✓ AL DÍA'}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${iterationProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] font-mono text-zinc-600">
                {new Date(activeIteration.startDate).toLocaleDateString()}
              </span>
              <span className="text-[10px] font-mono text-zinc-600">{iterationProgress}% transcurrido</span>
              <span className="text-[10px] font-mono text-zinc-600">
                {new Date(activeIteration.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Velocity */}
          <div className="group p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl hover:border-zinc-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 animate-[slide-up_0.3s_ease-out]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Velocidad</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-indigo-400"
                  aria-hidden="true"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-100">{velocity}</div>
            <div className="text-xs text-zinc-500 mt-1">pts / iteración</div>
          </div>

          {/* Stories */}
          <div className="group p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl hover:border-zinc-700 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200 animate-[slide-up_0.3s_ease-out] [animation-delay:50ms]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Historias</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-400"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-100">
              {doneStories}
              <span className="text-lg text-zinc-500">/{totalStories}</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">{currentStories} en progreso</div>
          </div>

          {/* Pairing Coverage */}
          <div className="group p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl hover:border-zinc-700 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200 animate-[slide-up_0.3s_ease-out] [animation-delay:100ms]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Parejas</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-amber-400"
                  aria-hidden="true"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-100">
              {pairingCoverage}
              <span className="text-lg text-zinc-500">%</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">{totalPairHours}h tiempo total en pareja</div>
          </div>

          {/* TDD Rate */}
          <div className="group p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl hover:border-zinc-700 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-200 animate-[slide-up_0.3s_ease-out] [animation-delay:150ms]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tasa de TDD</span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-sky-400"
                  aria-hidden="true"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-zinc-100">
              {tddRate}
              <span className="text-lg text-zinc-500">%</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {tddStories} de {totalStories} primero con pruebas
            </div>
          </div>
        </div>

        {/* Two Column Layout: Recent Activity & Team/Debt */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Pair Sessions */}
          <div className="lg:col-span-2 rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm animate-[slide-up_0.4s_ease-out]">
            <div className="px-5 py-4 border-b border-zinc-800/50">
              <h2 className="text-sm font-semibold text-zinc-300">Sesiones en Pareja Recientes</h2>
            </div>
            <div className="divide-y divide-zinc-800/50">
              {pairSessions.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-zinc-500">
                  Aún no se han registrado sesiones en pareja
                </div>
              ) : (
                [...pairSessions]
                  .slice(-5)
                  .reverse()
                  .map((session, idx) => (
                    <div
                      key={`pair-session-${session.id || idx}`}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-zinc-800/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-xs">
                          👥
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-200">{session.title}</div>
                          <div className="text-xs text-zinc-500 font-mono">
                            {session.participants ? session.participants.join(' & ') : 'Programadores'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-zinc-500">{session.durationMinutes}m</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                          {statusTranslations[session.status] || session.status}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Team Roles */}
            {project && (
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm animate-[slide-in-right_0.4s_ease-out]">
                <div className="px-4 py-3 border-b border-zinc-800/50">
                  <h2 className="text-sm font-semibold text-zinc-300">Roles de Equipo XP</h2>
                </div>
                <div className="p-4 space-y-2.5">
                  {project.roles.map((member) => (
                    <div key={`role-${member.name}`} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">{member.name}</span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                        {roleTranslations[member.role] || member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Debt */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm animate-[slide-in-right_0.5s_ease-out]">
              <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-300">Deuda Técnica</h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    openDebt > 0
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {openDebt} abiertas
                </span>
              </div>
              <div className="p-4 space-y-2.5">
                {[...debtItems].slice(0, 3).map((item) => (
                  <div key={`debt-${item.id}`} className="flex items-center gap-2 text-sm justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          item.status === 'Open' ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-zinc-400 truncate">{item.title}</span>
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-zinc-800 text-zinc-500 px-1 py-0.5 rounded">
                      {typeTranslations[item.type] || item.type}
                    </span>
                  </div>
                ))}
                {debtItems.length === 0 && (
                  <div className="text-xs text-zinc-500 italic">Sin deuda técnica registrada</div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm p-4 animate-[slide-in-right_0.6s_ease-out]">
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">Navegación Rápida</h2>
              <div className="space-y-2">
                <a
                  href="/stories"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent hover:border-zinc-800 transition-all"
                >
                  <span>📝</span> Escribir Historias de Usuario
                </a>
                <a
                  href="/planning"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent hover:border-zinc-800 transition-all"
                >
                  <span>🎯</span> Juego de Planeación (DnD)
                </a>
                <a
                  href="/health"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent hover:border-zinc-800 transition-all"
                >
                  <span>📊</span> Panel de Adherencia
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

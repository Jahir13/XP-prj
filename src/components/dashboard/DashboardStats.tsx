import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories, calculateIterationPoints, type RuntimeStory } from '../../store/stories';
import { $sessionHistory } from '../../store/pairSession';
import { $runtimeLogs } from '../../store/logs';
import { $currentUser } from '../../store/auth';
import { $isClientMode } from '../../store/ui';
import { $iterations } from '../../store/iterations';
import type { Story, Iteration } from '../../types';
import StoryDetailDrawer from '../stories/StoryDetailDrawer';
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

const getInitials = (name: string): string => {
  if (!name) return '?';
  if (name.includes('Christian')) return 'CP';
  if (name.includes('Jahir')) return 'JR';
  if (name.includes('Ariel')) return 'AR';
  if (name.includes('Kevin')) return 'KP';
  if (name.includes('Jhonathan')) return 'JP';
  if (name.includes('Santiago')) return 'SP';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export default function DashboardStats({ initialStories, initialIterations, initialLogs, project }: Props) {
  // Bind to runtime stores
  const runtimeStories = useStore($runtimeStories);
  const sessionHistory = useStore($sessionHistory);
  const runtimeLogs = useStore($runtimeLogs);
  const currentUser = useStore($currentUser);
  const isClientMode = useStore($isClientMode);
  const runtimeIterations = useStore($iterations);

  // Selected story to display inside drawer
  const [selectedStory, setSelectedStory] = useState<RuntimeStory | null>(null);

  // System Metaphor Banner collapse state
  const [hideMetaphor, setHideMetaphor] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('xp-hide-metaphor') === 'true';
  });

  // Automatically activate client mode if authenticated user is Cliente
  useEffect(() => {
    if (currentUser?.xpRole === 'Cliente') {
      $isClientMode.set(true);
    }
  }, [currentUser]);

  // Merge stories
  const stories = useMemo((): RuntimeStory[] => {
    if (typeof window === 'undefined' || runtimeStories.length === 0) {
      return initialStories as unknown as RuntimeStory[];
    }
    return runtimeStories;
  }, [runtimeStories, initialStories]);

  // Merge iterations
  const iterations = useMemo((): Iteration[] => {
    if (typeof window === 'undefined' || runtimeIterations.length === 0) {
      return initialIterations;
    }
    return runtimeIterations;
  }, [runtimeIterations, initialIterations]);

  // Pair Sessions Merged State
  const pairSessions = useMemo(() => {
    const staticSessions = initialLogs.filter((l) => l.type === 'pair-session');
    if (typeof window === 'undefined') {
      return staticSessions;
    }

    const formattedHistory: LogEntry[] = sessionHistory.map((s) => ({
      id: s.id,
      type: 'pair-session',
      title: `Programación en Pareja`,
      date: new Date(s.startTime).toISOString().split('T')[0],
      participants: [s.driver, s.navigator],
      durationMinutes: s.durationMinutes,
      status: 'Resolved',
    }));

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

  // Tech Debt & Refactors Merged State
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

  // Pairing Coverage
  const storiesWithPairs = stories.filter((s) => s.assignedPair && s.assignedPair.length >= 2).length;
  const pairingCoverage = totalStories > 0 ? Math.round((storiesWithPairs / totalStories) * 100) : 0;

  // TDD Rate
  const tddStories = stories.filter((s) => s.isTDD).length;
  const tddRate = totalStories > 0 ? Math.round((tddStories / totalStories) * 100) : 0;

  // Completed iterations count and velocity calculation
  const completedIterations = useMemo(() => {
    return iterations.filter((i) => i.status === 'Completed').length;
  }, [iterations]);

  const velocity = completedIterations > 0 ? Math.round(donePoints / Math.max(completedIterations, 1)) : donePoints;

  // Pair hours
  const totalPairMinutes = pairSessions.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
  const totalPairHours = Math.round((totalPairMinutes / 60) * 10) / 10;

  // Open Debt count
  const openDebt = debtItems.filter((l) => l.status === 'Open').length;

  const getCapacityBadge = (points: number, capacity: number) => {
    if (points > capacity) {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          ⚠ SOBRE CAPACIDAD
        </span>
      );
    } else if (points === capacity) {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          ⚡ CAPACIDAD EXACTA
        </span>
      );
    } else {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ✓ DENTRO DE CAPACIDAD
        </span>
      );
    }
  };

  // CLIENT VIEW (Ariel Rosas / Client Preview Mode)
  if (isClientMode) {
    return (
      <ErrorBoundary>
        <div className="space-y-6 animate-[fade-in_0.3s_ease-out]">
          {/* Metaphor banner - always visible in Client mode */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
            <span className="text-2xl">🎙️</span>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100 font-sans">Secretario Inteligente de Reuniones</h4>
              <p className="text-xs text-zinc-400 font-sans">
                Capta todo lo hablado, ordena los compromisos y los mantiene visibles — Metáfora XP del sistema
              </p>
            </div>
          </div>

          {/* Client Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl">
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Valor Entregado</div>
              <div className="text-2xl font-bold text-zinc-100 font-mono">5 historias completadas</div>
              <div className="text-xs text-zinc-500 mt-1">15 pts de valor entregado</div>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                Garantía de Calidad
              </div>
              <div className="text-2xl font-bold text-zinc-100 font-mono">Tasa TDD: 85.7%</div>
              <div className="text-xs text-zinc-500 mt-1">Garantía de estabilidad técnica</div>
            </div>
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Próxima Demo</div>
              <div className="text-2xl font-bold text-zinc-100 font-mono">Iteración 3</div>
              <div className="text-xs text-zinc-500 mt-1">Hitos enriquecidos en desarrollo</div>
            </div>
          </div>

          {/* Client Stories Status columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Historias listas para validar */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm p-4">
              <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Historias listas para validar
              </h3>
              <div className="space-y-3">
                {stories
                  .filter((s) => s.status === 'Done')
                  .map((story) => (
                    <div
                      key={story.id}
                      className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-zinc-200">{story.title}</span>
                        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {story.id.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Validar criterios ✓
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* En progreso */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm p-4">
              <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                En progreso
              </h3>
              <div className="space-y-3">
                {stories
                  .filter((s) => s.status === 'Current')
                  .map((story) => (
                    <div
                      key={story.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedStory(story)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedStory(story);
                        }
                      }}
                      className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col gap-2 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-zinc-200">{story.title}</span>
                        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {story.id.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">Esfuerzo estimado: {story.points} pts</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Pendiente de inicio */}
            <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm p-4">
              <h3 className="text-sm font-bold text-sky-400 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                Pendiente de inicio
              </h3>
              <div className="space-y-3">
                {stories
                  .filter((s) => s.status === 'Backlog')
                  .map((story) => (
                    <div
                      key={story.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedStory(story)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedStory(story);
                        }
                      }}
                      className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col gap-2 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-bold text-zinc-200">{story.title}</span>
                        <span className="px-2 py-0.5 rounded font-mono text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {story.id.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">Esfuerzo estimado: {story.points} pts</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Drawer for Story Details */}
          {selectedStory && <StoryDetailDrawer story={selectedStory} onClose={() => setSelectedStory(null)} />}
        </div>
      </ErrorBoundary>
    );
  }

  // STANDARD VIEW (Coach, Gestor, Tracker, Programmer)
  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Metaphor Banner */}
        {!hideMetaphor && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎙️</span>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100 font-sans">Secretario Inteligente de Reuniones</h4>
                <p className="text-xs text-zinc-400 font-sans">
                  Capta todo lo hablado, ordena los compromisos y los mantiene visibles — Metáfora XP del sistema
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setHideMetaphor(true);
                localStorage.setItem('xp-hide-metaphor', 'true');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-semibold cursor-pointer transition-all"
            >
              Ocultar
            </button>
          </div>
        )}

        {/* Iterations Grid Section */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <span>📅</span> Iteraciones del Proyecto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {iterations.map((iter) => {
              const iterStories = stories.filter((s) => {
                const storyIter = s.iteration || '';
                return (
                  storyIter === `iteration-${iter.number}` ||
                  storyIter.replace('iteration-', '') === String(iter.number)
                );
              });
              const points = calculateIterationPoints(stories, iter.number);
              const completedPoints = iterStories
                .filter((s) => s.status === 'Done')
                .reduce((sum, s) => sum + s.points, 0);
              const isActive = iter.status === 'Active'; // Iteration 3
              const progressPercent = points > 0 ? Math.round((completedPoints / points) * 100) : 0;

              // Date calculations
              const start = new Date(iter.startDate).getTime();
              const now = Date.now();
              const elapsedDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={iter.id}
                  className={`relative p-5 rounded-xl bg-zinc-900/60 border backdrop-blur-sm transition-all duration-300 flex flex-col justify-between ${
                    isActive
                      ? 'border-l-4 border-l-indigo-500 border-zinc-700 bg-zinc-900/80 shadow-lg shadow-indigo-500/5'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-3 right-3 text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-500 text-white animate-pulse">
                      ACTIVA
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-zinc-500">Iteración {iter.number}</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-200 mb-2 truncate" title={iter.name}>
                      {iter.name}
                    </h3>

                    <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-3">
                      <span>
                        {points} / {iter.capacity} pts
                      </span>
                      {getCapacityBadge(points, iter.capacity)}
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1 mb-4">
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isActive ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-zinc-600'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                        <span>{progressPercent}% completado</span>
                        {isActive && <span>{elapsedDays} días transcurridos (semana 6)</span>}
                      </div>
                    </div>

                    {/* Stories Sub-list */}
                    <div className="space-y-2 mt-4 pt-3 border-t border-zinc-800/80">
                      <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-2">
                        Historias de Usuario
                      </span>
                      {iterStories.length === 0 ? (
                        <div className="text-[10px] text-zinc-600 italic">Sin historias asignadas</div>
                      ) : (
                        iterStories.map((story) => (
                          <div
                            key={story.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedStory(story)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                setSelectedStory(story);
                              }
                            }}
                            className="flex items-center justify-between p-2 rounded bg-zinc-950/40 border border-zinc-800/60 hover:bg-zinc-800/20 hover:border-zinc-700 transition-all cursor-pointer text-[11px]"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="px-1 py-0.2 rounded font-mono text-[8px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                                {story.id.toUpperCase()}
                              </span>
                              <span className="text-zinc-300 truncate" title={story.title}>
                                {story.title.length > 25 ? story.title.slice(0, 25) + '...' : story.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span
                                className={`px-1 py-0.2 rounded text-[7.5px] font-mono border ${
                                  story.status === 'Done'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                                    : story.status === 'Current'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                                      : 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                                }`}
                              >
                                {story.status === 'Done'
                                  ? 'Terminado'
                                  : story.status === 'Current'
                                    ? 'En Curso'
                                    : 'Bcklg'}
                              </span>
                              <span className="text-zinc-500 font-mono text-[9px]">{story.points} pts</span>
                              <div className="flex -space-x-1">
                                {story.assignedPair &&
                                  story.assignedPair.map((member) => (
                                    <div
                                      key={member}
                                      className="w-4 h-4 rounded-full bg-zinc-850 border border-zinc-700 text-zinc-300 flex items-center justify-center text-[7px] font-bold"
                                      title={member}
                                    >
                                      {getInitials(member)}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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

        {/* Drawer for Story Details */}
        {selectedStory && <StoryDetailDrawer story={selectedStory} onClose={() => setSelectedStory(null)} />}
      </div>
    </ErrorBoundary>
  );
}

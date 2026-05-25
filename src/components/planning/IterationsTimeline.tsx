import { useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories } from '../../store/stories';
import type { Story } from '../../types';

interface Iteration {
  id: string;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  velocity: number;
  capacity: number;
  status: 'Planning' | 'Active' | 'Completed';
}

interface Props {
  initialIterations: Iteration[];
  initialStories: Story[];
}

const statusTranslations = {
  Completed: 'Completada',
  Active: 'Activa',
  Planning: 'Planeación',
};

const storyStatusTranslations = {
  Backlog: 'Backlog',
  Current: 'En Curso',
  Done: 'Terminado',
};

export default function IterationsTimeline({ initialIterations, initialStories }: Props) {
  const runtimeStories = useStore($runtimeStories);
  const [expandedIter, setExpandedIter] = useState<string | null>('iteration-1');

  // Merge runtime stories
  const stories = useMemo(() => {
    if (typeof window === 'undefined' || runtimeStories.length === 0) {
      return initialStories;
    }
    return runtimeStories;
  }, [runtimeStories, initialStories]);

  // Aggregate stories by iteration
  const iterData = useMemo(() => {
    return initialIterations.map((iter) => {
      // Find stories assigned to this iteration
      // e.g. "iteration-1"
      const iterStories = stories.filter((s) => {
        const storyIter = ('iteration' in s ? s.iteration : (s as Story).iterationId) || '';
        return storyIter === iter.id || storyIter.replace('iteration-', '') === String(iter.number);
      });

      const totalPoints = iterStories.reduce((sum, s) => sum + s.points, 0);
      const donePoints = iterStories.filter((s) => s.status === 'Done').reduce((sum, s) => sum + s.points, 0);
      const isOverCapacity = totalPoints > iter.capacity;

      return {
        ...iter,
        stories: iterStories,
        totalPoints,
        donePoints,
        isOverCapacity,
      };
    });
  }, [initialIterations, stories]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Hoja de Ruta de Entregas (Roadmap)</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Práctica XP: Entregas Pequeñas y Seguimiento de Cadencia
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-400">
            Cadencia Total: <span className="text-indigo-400 font-bold">1 semana</span>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-zinc-800 ml-4 pl-8 space-y-8">
        {iterData.map((iter) => {
          const isExpanded = expandedIter === iter.id;
          const statusColors = {
            Completed: 'border-zinc-500 text-zinc-400 bg-zinc-500/10',
            Active: 'border-emerald-500 text-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/5',
            Planning: 'border-indigo-500 text-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/5',
          };

          return (
            <div key={iter.id} className="relative group">
              {/* Chronological Circle Indicator */}
              <span
                className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center font-mono text-[10px] font-bold ${
                  iter.status === 'Completed'
                    ? 'bg-zinc-950 border-zinc-700 text-zinc-500'
                    : iter.status === 'Active'
                      ? 'bg-zinc-950 border-emerald-500 text-emerald-400'
                      : 'bg-zinc-950 border-indigo-500 text-indigo-400'
                }`}
              >
                {iter.number}
              </span>

              {/* Card Container */}
              <div
                className={`rounded-xl border bg-zinc-900/40 backdrop-blur-md overflow-hidden transition-all duration-200 ${
                  isExpanded ? 'border-zinc-700 bg-zinc-900/60' : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Accordion Header */}
                <div
                  role="button"
                  tabIndex={0}
                  className="px-5 py-4 flex items-center justify-between cursor-pointer select-none focus:outline-none focus:bg-zinc-800/10"
                  onClick={() => setExpandedIter(isExpanded ? null : iter.id)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setExpandedIter(isExpanded ? null : iter.id);
                    }
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-zinc-200">{iter.name}</h3>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${statusColors[iter.status]}`}
                      >
                        {statusTranslations[iter.status] || iter.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      {new Date(iter.startDate).toLocaleDateString()} — {new Date(iter.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Capacity Gauge */}
                    <div className="text-right">
                      <div className="text-xs font-mono text-zinc-400">
                        Puntos:{' '}
                        <span className={`font-bold ${iter.isOverCapacity ? 'text-rose-400' : 'text-zinc-200'}`}>
                          {iter.totalPoints}
                        </span>{' '}
                        / {iter.capacity}
                      </div>
                      <div className="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            iter.isOverCapacity
                              ? 'bg-rose-500'
                              : iter.status === 'Completed'
                                ? 'bg-zinc-600'
                                : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                          }`}
                          style={{ width: `${Math.min(100, (iter.totalPoints / iter.capacity) * 100)}%` }}
                        ></div>
                      </div>
                      {iter.isOverCapacity && (
                        <span className="text-[9px] font-mono font-semibold text-rose-400 block mt-0.5">
                          ⚠ SOBRE CAPACIDAD
                        </span>
                      )}
                    </div>

                    {/* Expand Arrow */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-zinc-800/60 bg-zinc-950/20 divide-y divide-zinc-800/40">
                    <div className="py-3 flex justify-between items-center text-xs font-mono text-zinc-500">
                      <span>Historias Comprometidas: {iter.stories.length}</span>
                      <span>
                        Puntos Terminados: {iter.donePoints} (
                        {iter.totalPoints > 0 ? Math.round((iter.donePoints / iter.totalPoints) * 100) : 0}% completado)
                      </span>
                    </div>

                    <div className="py-3 space-y-2">
                      {iter.stories.length === 0 ? (
                        <div className="text-center py-6 text-xs text-zinc-600 italic">
                          No hay historias comprometidas para esta iteración. Ve al tablero del Juego de Planeación para
                          asignar algunas tarjetas.
                        </div>
                      ) : (
                        iter.stories.map((story) => {
                          const statusColors = {
                            Backlog: 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50',
                            Current: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                            Done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                          };

                          return (
                            <div
                              key={story.id}
                              className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-between hover:bg-zinc-800/20 hover:border-zinc-800 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${statusColors[story.status as 'Backlog' | 'Current' | 'Done']}`}
                                >
                                  {storyStatusTranslations[story.status as 'Backlog' | 'Current' | 'Done'] ||
                                    story.status}
                                </span>
                                <span className="text-sm font-medium text-zinc-300">{story.title}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                {story.isTDD && (
                                  <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded">
                                    TDD
                                  </span>
                                )}
                                <span className="text-xs font-mono text-zinc-500">
                                  {story.points} {story.points === 1 ? 'punto' : 'puntos'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

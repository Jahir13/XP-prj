import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories, updateStoryStatus, updateStory, type RuntimeStory } from '../../store/stories';
import type { Story } from '../../types';

const statusTranslations: Record<string, string> = {
  Backlog: 'Backlog',
  Current: 'En Curso',
  Done: 'Terminado',
};

export default function TDDDashboard() {
  const stories = useStore($runtimeStories);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  // Test Runner States
  const [testState, setTestState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [autoRun, setAutoRun] = useState(false);

  // Filter current/done stories for test coverage
  const targetStories = useMemo(() => {
    return stories.filter((s) => s.status === 'Current' || s.status === 'Done');
  }, [stories]);

  const activeStory = useMemo(() => {
    return stories.find((s) => s.id === activeStoryId) || null;
  }, [stories, activeStoryId]);

  // TDD Rate Calculation
  const tddMetrics = useMemo(() => {
    if (targetStories.length === 0) return { count: 0, rate: 0 };
    const tddCount = targetStories.filter((s) => s.isTDD).length;
    const rate = Math.round((tddCount / targetStories.length) * 100);
    return { count: tddCount, rate };
  }, [targetStories]);

  // Run mock test runner simulation
  const runTests = () => {
    if (testState === 'running') return;
    setTestState('running');
    setConsoleLogs([]);

    const steps = [
      '🚀 Inicializando ejecutor de pruebas principal de Vitest en el entorno sandbox...',
      '🔍 Resolving suites de prueba en directorios que coinciden con: src/**/*.test.ts...',
      '⏳ EJECUTANDO  src/store/stories.test.ts',
      '  ✓ addStory añade tarjeta al registro de historias y activa sincronización con almacenamiento local (12ms)',
      '  ✓ updateStoryStatus cambia los estados de progresión de la historia en el juego de planeación (8ms)',
      'APROBADO  src/store/stories.test.ts (2.4s)',
      '⏳ EJECUTANDO  src/store/pairSession.test.ts',
      '  ✓ startSession monta conductor y navegador en el temporizador de pareja (6ms)',
      '  ✓ swapRoles intercambia las referencias activas de conductor-navegador limpiamente (4ms)',
      '  ✓ stopSession activa el registro de sesión e ingresa el log de historial (9ms)',
      'APROBADO  src/store/pairSession.test.ts (1.8s)',
      '⏳ EJECUTANDO  src/components/planning/IterationBoard.test.tsx',
      '  ✓ IterationBoard ajusta las asignaciones de historias bajo activadores de dnd (34ms)',
      'APROBADO  src/components/planning/IterationBoard.test.tsx (3.1s)',
      '🎉 ¡Todas las suites de prueba pasaron con éxito!',
      '   Suites de Prueba: 3 aprobadas, 3 en total',
      '   Pruebas:          6 aprobadas, 6 en total',
      '   Snapshots:        0 en total',
      '   Tiempo:           7.3s',
      '✅ ¡Ciclos de retroalimentación continua cerrados! Secuencia de verificación TDD completada.',
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setConsoleLogs((prev) => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setTestState('completed');
      }
    }, 400); // Ticks every 400ms to simulate scrolling terminal logs
  };

  // Run automatically if auto-run is toggled and a story updates
  useEffect(() => {
    if (autoRun && stories.length > 0) {
      runTests();
    }
  }, [stories, autoRun]);

  // Handle checking off an acceptance criterion
  const toggleCriterion = (storyId: string, index: number) => {
    const story = stories.find((s) => s.id === storyId);
    if (!story) return;

    // We can track completed criteria in stories. However, since the frontmatter schema does not have a
    // separate "completedCriteria" array, we can toggle 'isTDD' or update acceptance criteria strings.
    // For a fully local state check, let's store checked criteria in localStorage specifically for this view.
    const storageKey = `xp-flow-acceptance-${storyId}`;
    const saved = localStorage.getItem(storageKey);
    const checked = saved ? JSON.parse(saved) : {};
    checked[index] = !checked[index];
    localStorage.setItem(storageKey, JSON.stringify(checked));

    // Force reactive re-render by doing a shallow story update
    updateStory(storyId, {});
  };

  const getStoryCheckedCriteria = (storyId: string): Record<number, boolean> => {
    if (typeof window === 'undefined') return {};
    const storageKey = `xp-flow-acceptance-${storyId}`;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  };

  // Determine if all criteria are checked for a story
  const areAllCriteriaChecked = (story: RuntimeStory | Story) => {
    const criteria = story.acceptanceCriteria || [];
    if (criteria.length === 0) return false;
    const checked = getStoryCheckedCriteria(story.id);
    return criteria.every((_: unknown, idx: number) => checked[idx] === true);
  };

  const handleAcceptStory = (storyId: string) => {
    updateStoryStatus(storyId, 'Done');
    // Set activeStory to null or keep it
    // Run tests automatically to close the TDD loop
    runTests();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Panel de Pruebas y TDD</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Práctica XP: Desarrollo Guiado por Pruebas (TDD) y Pruebas de Aceptación
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-400">
            Ejecución Automática:
            <button
              onClick={() => setAutoRun(!autoRun)}
              className={`relative w-8 h-[16px] rounded-full transition-colors duration-200 cursor-pointer ${
                autoRun ? 'bg-indigo-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-[1px] left-[1px] w-[14px] h-[14px] rounded-full bg-white transition-transform duration-200 ${
                  autoRun ? 'translate-x-[14px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: TDD Gauges & Story Acceptance */}
        <div className="lg:col-span-1 space-y-6">
          {/* TDD Gauge Card */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 w-full text-left">Tasa de Cumplimiento de TDD</h3>

            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-zinc-800" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className={`transition-all duration-1000 ${
                    tddMetrics.rate >= 80
                      ? 'stroke-emerald-500'
                      : tddMetrics.rate >= 50
                        ? 'stroke-indigo-500'
                        : 'stroke-rose-500'
                  }`}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 - (263.89 * tddMetrics.rate) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-mono font-bold text-zinc-100">{tddMetrics.rate}%</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Cumple</span>
              </div>
            </div>

            <div className="text-xs text-zinc-400 font-mono">
              <strong className="text-zinc-200">{tddMetrics.count}</strong> / {targetStories.length} historias activas
              tienen TDD habilitado.
            </div>

            {tddMetrics.rate < 70 && (
              <p className="text-[10px] text-amber-400/90 leading-relaxed font-mono border border-amber-500/10 bg-amber-500/5 p-2 rounded-lg">
                ⚠ ¡La tasa de TDD es baja! Escriba pruebas unitarias automatizadas antes de escribir código para
                asegurar la cobertura.
              </p>
            )}
          </div>

          {/* Stories Acceptance list */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">Lista de Aceptación de Historias</h3>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {stories
                .filter((s) => s.status !== 'Done')
                .map((story) => {
                  const checked = getStoryCheckedCriteria(story.id);
                  const total = story.acceptanceCriteria.length;
                  const completed = story.acceptanceCriteria.filter((_, i) => checked[i]).length;
                  const hasPassedAll = areAllCriteriaChecked(story);

                  return (
                    <button
                      key={story.id}
                      onClick={() => setActiveStoryId(activeStoryId === story.id ? null : story.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer block ${
                        activeStoryId === story.id
                          ? 'bg-zinc-800/40 border-indigo-500/30'
                          : 'bg-zinc-950/20 border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-200 truncate pr-2">{story.title}</span>
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            story.status === 'Current'
                              ? 'bg-indigo-500/10 text-indigo-400'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {statusTranslations[story.status] || story.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-zinc-500">
                        <span>
                          Pruebas de Aceptación: {completed}/{total}
                        </span>
                        {hasPassedAll && <span className="text-emerald-400 font-bold animate-pulse">✓ LISTA</span>}
                      </div>
                    </button>
                  );
                })}

              {stories.filter((s) => s.status !== 'Done').length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-500 italic">
                  ¡Todas las historias están aceptadas y listas! 🎉
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Console Log & Active Story acceptance criteria checklist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Story checklist drawer */}
          {activeStory && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4 animate-[fade-in_0.2s_ease-out]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-indigo-400 uppercase font-semibold">
                    Verificar Aceptación
                  </span>
                  <h3 className="text-sm font-bold text-zinc-200 mt-0.5">{activeStory.title}</h3>
                </div>
                {areAllCriteriaChecked(activeStory) && activeStory.status !== 'Done' && (
                  <button
                    onClick={() => handleAcceptStory(activeStory.id)}
                    className="px-3 py-1.5 text-xs font-bold font-mono rounded bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/10 transition-colors cursor-pointer"
                  >
                    Aceptar y Desplegar Historia
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {activeStory.acceptanceCriteria.map((criterion, idx) => {
                  const isChecked = getStoryCheckedCriteria(activeStory.id)[idx] || false;
                  return (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleCriterion(activeStory.id, idx)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleCriterion(activeStory.id, idx);
                        }
                      }}
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-800/60 hover:bg-zinc-800/10 cursor-pointer select-none transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                          isChecked ? 'bg-emerald-500/20 border-emerald-500/40' : 'border-zinc-700'
                        }`}
                      >
                        {isChecked && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-emerald-400"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${isChecked ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                        {criterion}
                      </span>
                    </div>
                  );
                })}

                {activeStory.acceptanceCriteria.length === 0 && (
                  <div className="text-xs text-zinc-500 italic py-2">
                    No se encontraron criterios de aceptación explícitos en esta tarjeta.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mock Test Runner */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-200">Consola de Vitest Simulada</h3>
              <button
                onClick={runTests}
                disabled={testState === 'running'}
                className={`px-3 py-1.5 text-xs font-semibold rounded shadow-md transition-all cursor-pointer ${
                  testState === 'running'
                    ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/10'
                }`}
              >
                {testState === 'running' ? 'Ejecutando Pruebas...' : 'Ejecutar Suite de Pruebas'}
              </button>
            </div>

            {/* Monospace terminal */}
            <div className="rounded-lg bg-black border border-zinc-800 p-4 h-80 overflow-y-auto font-mono text-xs leading-relaxed space-y-1.5 text-zinc-400 shadow-inner">
              {consoleLogs.map((log, idx) => {
                let colorClass = 'text-zinc-300';
                if (
                  log.includes('✓') ||
                  log.includes('APROBADO') ||
                  log.includes('passed') ||
                  log.includes('✅') ||
                  log.includes('éxito')
                ) {
                  colorClass = 'text-emerald-400';
                } else if (log.includes('🚀') || log.includes('🎉')) {
                  colorClass = 'text-indigo-400';
                } else if (log.includes('⏳') || log.includes('EJECUTANDO')) {
                  colorClass = 'text-zinc-500';
                }
                return (
                  <div key={idx} className={colorClass}>
                    {log}
                  </div>
                );
              })}

              {consoleLogs.length === 0 && testState === 'idle' && (
                <div className="text-zinc-600 italic h-full flex items-center justify-center text-center">
                  Terminal lista. Haga clic en "Ejecutar Suite de Pruebas" para simular el entorno de pruebas
                  automatizadas.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

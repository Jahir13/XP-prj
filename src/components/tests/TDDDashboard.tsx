import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories, updateStory, type RuntimeStory } from '../../store/stories';
import { $currentUser } from '../../store/auth';
import { e2eCodes, integrationCodes } from './testCodes';

const statusTranslations: Record<string, string> = {
  Backlog: 'Backlog',
  Current: 'En Curso',
  Done: 'Terminado',
};

// Static seed mapping for stories evidence & tests details
const STORIES_METRICS = {
  'hu-01': {
    unit: 3,
    functional: 6,
    file: 'src/components/MeetingRecorder.tsx',
    funcName: 'iniciarSesion, finalizarSesion, solicitarPermiso',
  },
  'hu-02': {
    unit: 3,
    functional: 5,
    file: 'src/components/MeetingRecorder.tsx',
    funcName: 'procesarFragmentoAudio, agregarTextoTranscripcion, detenerCaptura',
  },
  'hu-03': {
    unit: 2,
    functional: 2,
    file: 'src/components/MeetingRecorder.tsx',
    funcName: 'asignarEtiquetaHablante, resetearHablantes',
  },
  'hu-04': {
    unit: 4,
    functional: 6,
    file: 'src/components/MeetingRecorder.tsx',
    funcName: 'construirPrompt, parsearRespuestaLLM, editarItem, eliminarItem',
  },
  'hu-05': { unit: 2, functional: 1, file: 'src/components/Dashboard.tsx', funcName: 'guardarTarea, obtenerTareas' },
  'hu-06': {
    unit: 3,
    functional: 3,
    file: 'src/components/Dashboard.tsx',
    funcName: 'ordenarTareasPorFecha, marcarCompletada, obtenerTareasPendientes',
  },
  'hu-07': {
    unit: 3,
    functional: 3,
    file: 'src/components/Dashboard.tsx',
    funcName: 'clasificarItem, guardarObservacion, obtenerObservacionesPorReunion',
  },
};

const doneChecklistItems = [
  '100% de las pruebas unitarias del módulo pasan correctamente.',
  '100% de las pruebas funcionales E2E en Playwright aprobadas.',
  'Pruebas de integración del escenario completadas sin regresión.',
  'El Cliente (Ariel Rosas) valida los criterios en demostración formal.',
  'Código de negocio refactorizado y libre de warnings de linter/tipos.',
  'Documentación y observaciones de arquitectura actualizadas.',
  'La compilación e integración continua (CI pipeline) completan en verde.',
];

export default function TDDDashboard() {
  const stories = useStore($runtimeStories);
  const currentUser = useStore($currentUser);

  // Tab state, initialized or synced from query parameter
  const [activeTab, setActiveTab] = useState<'plan' | 'e2e' | 'integration'>('plan');

  // Accordion lists
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [expandedE2EStoryId, setExpandedE2EStoryId] = useState<string | null>(null);
  const [expandedIntScenarioId, setExpandedIntScenarioId] = useState<string | null>(null);

  // Code Viewer Modal State
  const [codeModal, setCodeModal] = useState<{ isOpen: boolean; title: string; code: string; cmd: string } | null>(
    null,
  );
  const [copySuccess, setCopySuccess] = useState(false);

  // Test Runner Simulation States
  const [testState, setTestState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [autoRun, setAutoRun] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Sync tab from URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'plan') setActiveTab('plan');
      else if (tab === 'e2e') setActiveTab('e2e');
      else if (tab === 'integration') setActiveTab('integration');
    }
  }, []);

  // TDD Rate Calculation
  const tddMetrics = useMemo(() => {
    if (stories.length === 0) return { count: 6, rate: 85.7 };
    const tddCount = stories.filter((s) => s.isTDD).length;
    const rate = Math.round((tddCount / stories.length) * 100);
    return { count: tddCount, rate };
  }, [stories]);

  // Dynamic pass counters linked to simulated Vitest execution
  const executionPass = useMemo(() => {
    if (testState === 'completed') {
      return {
        unit: { total: 40, passed: 40, rate: 100 },
        e2e: { total: 26, passed: 26, rate: 100 },
        integration: { total: 19, passed: 19, rate: 100 },
      };
    }
    // Default canonical passes
    return {
      unit: { total: 40, passed: 34, rate: 85 },
      e2e: { total: 26, passed: 24, rate: 92 },
      integration: { total: 19, passed: 15, rate: 78 },
    };
  }, [testState]);

  // Run mock test runner simulation
  const runTests = () => {
    if (testState === 'running') return;
    setTestState('running');
    setConsoleLogs([]);

    const steps = [
      '🚀 Inicializando ejecutor de pruebas principal de Vitest en el entorno sandbox...',
      '🔍 Resolviendo suites de prueba en directorios que coinciden con: src/**/*.test.ts...',
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
    }, 300);
  };

  // Run automatically if auto-run is toggled and a story updates
  useEffect(() => {
    if (autoRun && stories.length > 0) {
      runTests();
    }
  }, [stories, autoRun]);

  // Handle checking off an acceptance criterion
  const toggleCriterion = (storyId: string, index: number) => {
    if (currentUser?.role !== 'Programmer/Tester') {
      setRoleError('Acceso Denegado: Solo los programadores/testers (Kevin o Jhonathan) pueden validar criterios.');
      setTimeout(() => setRoleError(null), 4000);
      return;
    }

    const story = stories.find((s) => s.id === storyId);
    if (!story) return;

    const storageKey = `xp-flow-acceptance-${storyId}`;
    const saved = localStorage.getItem(storageKey);
    const checked = saved ? JSON.parse(saved) : {};
    checked[index] = !checked[index];
    localStorage.setItem(storageKey, JSON.stringify(checked));

    updateStory(storyId, {});
  };

  const getStoryCheckedCriteria = (storyId: string): Record<number, boolean> => {
    if (typeof window === 'undefined') return {};
    const storageKey = `xp-flow-acceptance-${storyId}`;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  };

  const areAllCriteriaChecked = (story: RuntimeStory) => {
    const criteria = story.acceptanceCriteria || [];
    if (criteria.length === 0) return false;
    const checked = getStoryCheckedCriteria(story.id);
    return criteria.every((_, idx) => checked[idx] === true);
  };

  const handleOpenCode = (title: string, code: string, cmd: string) => {
    setCodeModal({ isOpen: true, title, code, cmd });
    setCopySuccess(false);
  };

  const handleCopyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 font-sans">Panel de Pruebas Integrado</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Práctica XP: Plan de pruebas, Desarrollo Guiado por Pruebas (TDD) y Pruebas Funcionales
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
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

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-850" role="tablist">
        {[
          { id: 'plan', label: 'Plan de Pruebas' },
          { id: 'e2e', label: 'Pruebas Funcionales E2E' },
          { id: 'integration', label: 'Pruebas de Integración' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'plan' | 'e2e' | 'integration')}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`px-5 py-3 text-xs font-bold font-mono border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 font-extrabold'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {roleError && (
        <div className="text-xs text-rose-400 font-mono bg-rose-500/10 border border-rose-500/25 p-3 rounded-lg animate-pulse">
          ⚠️ {roleError}
        </div>
      )}

      {/* Tab 1: Plan de Pruebas */}
      {activeTab === 'plan' && (
        <div className="space-y-8 animate-[fade-in_0.2s_ease-out]">
          {/* Coverage KPI summary row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                type: 'Pruebas Unitarias',
                expected: '~40 esperados',
                passing: `${executionPass.unit.passed} pasando`,
                rate: `${executionPass.unit.rate}% cobertura`,
                color: 'text-indigo-400',
                border: 'border-indigo-500/20',
              },
              {
                type: 'Pruebas Funcionales E2E',
                expected: '26 esperados',
                passing: `${executionPass.e2e.passed} pasando`,
                rate: `${executionPass.e2e.rate}% cobertura`,
                color: 'text-emerald-400',
                border: 'border-emerald-500/20',
              },
              {
                type: 'Pruebas de Integración',
                expected: '19 esperados',
                passing: `${executionPass.integration.passed} pasando`,
                rate: `${executionPass.integration.rate}% cobertura`,
                color: 'text-amber-400',
                border: 'border-amber-500/20',
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`rounded-xl border ${card.border} bg-zinc-900/40 p-4.5 space-y-2.5 backdrop-blur-md`}
              >
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">{card.type}</span>
                <div className="flex justify-between items-baseline">
                  <span className={`text-2xl font-bold font-mono ${card.color}`}>{card.passing}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">de {card.expected.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono pt-1.5 border-t border-zinc-800/40">
                  <span>Adopción TDD</span>
                  <span className="font-bold">{card.rate}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: accordions and runners */}
            <div className="lg:col-span-2 space-y-6">
              {/* Accordion list of stories tested functions */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Módulos y Funciones Unitarias por Historia</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Estrategia TDD antes de codificar en MeetingVoice
                  </p>
                </div>

                <div className="divide-y divide-zinc-800/60 max-h-96 overflow-y-auto pr-1">
                  {stories.map((story) => {
                    const metric = STORIES_METRICS[story.id.toLowerCase() as keyof typeof STORIES_METRICS] || {
                      funcName: '',
                    };
                    const isExpanded = expandedStoryId === story.id;
                    const functions = metric.funcName.split(', ');

                    return (
                      <div key={story.id} className="py-2.5">
                        <button
                          onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                          className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-indigo-400">
                              [{story.id.toUpperCase()}]
                            </span>
                            <span className="text-xs font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                              {story.title}
                            </span>
                          </div>
                          <span className="text-zinc-500 text-[10px] font-mono flex items-center gap-1.5">
                            {functions.length} funciones
                            <span>{isExpanded ? '▲' : '▼'}</span>
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 pl-5 border-l-2 border-indigo-500/20 space-y-2 text-xs">
                            {functions.map((func, j) => (
                              <div
                                key={j}
                                className="flex items-center justify-between bg-zinc-950/40 p-2 rounded border border-zinc-800/40 font-mono text-[10.5px]"
                              >
                                <code className="text-zinc-300">{func}()</code>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                                    story.status === 'Done'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                  }`}
                                >
                                  {story.status === 'Done' ? 'Pasando ✓' : 'Pendiente'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strategy table */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Estrategia de Pruebas por Iteración</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Planificación incremental de aseguramiento de calidad
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">
                      ITERACIÓN 1 — MVP Funcional (Capacidad: 8 pts)
                    </span>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                          <th className="py-2">Historia</th>
                          <th className="py-2">Objetivo de Prueba</th>
                          <th className="py-2">Tipo de Prueba</th>
                          <th className="py-2 text-right">Prioridad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850 font-sans text-zinc-300">
                        <tr className="hover:bg-zinc-800/10">
                          <td className="py-2 font-mono font-bold text-zinc-400">HU-01</td>
                          <td className="py-2">Iniciar/Finalizar sesión de grabación</td>
                          <td className="py-2 font-mono text-zinc-400">Unitaria + E2E</td>
                          <td className="py-2 text-right text-rose-400 font-bold">Alta</td>
                        </tr>
                        <tr className="hover:bg-zinc-800/10">
                          <td className="py-2 font-mono font-bold text-zinc-400">HU-02</td>
                          <td className="py-2">Transcripción de voz en vivo</td>
                          <td className="py-2 font-mono text-zinc-400">Unitaria + E2E</td>
                          <td className="py-2 text-right text-rose-400 font-bold">Alta</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-400">
                      ITERACIÓN 2 — Extracción & Enriquecimiento (Capacidad: 12 pts)
                    </span>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                          <th className="py-2">Historia</th>
                          <th className="py-2">Objetivo de Prueba</th>
                          <th className="py-2">Tipo de Prueba</th>
                          <th className="py-2 text-right">Prioridad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850 font-sans text-zinc-300">
                        <tr className="hover:bg-zinc-800/10">
                          <td className="py-2 font-mono font-bold text-zinc-400">HU-04</td>
                          <td className="py-2">Extracción automática de compromisos con LLM</td>
                          <td className="py-2 font-mono text-zinc-400">Unitaria + E2E + Integración</td>
                          <td className="py-2 text-right text-rose-400 font-bold">Alta</td>
                        </tr>
                        <tr className="hover:bg-zinc-800/10">
                          <td className="py-2 font-mono font-bold text-zinc-400">HU-05</td>
                          <td className="py-2">Persistencia local segura</td>
                          <td className="py-2 font-mono text-zinc-400">Unitaria + Integración</td>
                          <td className="py-2 text-right text-rose-400 font-bold">Alta</td>
                        </tr>
                        <tr className="hover:bg-zinc-800/10">
                          <td className="py-2 font-mono font-bold text-zinc-400">HU-06</td>
                          <td className="py-2">Dashboard de control de pendientes</td>
                          <td className="py-2 font-mono text-zinc-400">Unitaria + E2E + Integración</td>
                          <td className="py-2 text-right text-rose-400 font-bold">Alta</td>
                        </tr>
                        <tr className="hover:bg-zinc-800/10">
                          <td className="py-2 font-mono font-bold text-zinc-400">HU-07</td>
                          <td className="py-2">Sección dedicada a observaciones generales</td>
                          <td className="py-2 font-mono text-zinc-400">Unitaria + E2E + Integración</td>
                          <td className="py-2 text-right text-amber-400 font-bold">Media</td>
                        </tr>
                        <tr className="hover:bg-zinc-800/10">
                          <td className="py-2 font-mono font-bold text-zinc-400">HU-03</td>
                          <td className="py-2">Diarización de hablantes</td>
                          <td className="py-2 font-mono text-zinc-400">Unitaria + E2E</td>
                          <td className="py-2 text-right text-zinc-500">Baja</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Matriz de Riesgos */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Matriz de Riesgos y Mitigación de Pruebas</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5 font-sans">
                    Identificación de puntos críticos del secretario inteligente
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                        <th className="py-2 w-48">Riesgo Detectado</th>
                        <th className="py-2 w-16">Historia</th>
                        <th className="py-2 w-16">Nivel</th>
                        <th className="py-2">Mitigación Mediante Pruebas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-zinc-300">
                      {[
                        {
                          r: 'Compatibilidad Web Speech API',
                          hu: 'HU-02',
                          l: 'Alto',
                          m: 'Verificación cruzada de compatibilidad en Chromium (E2E) e indicadores visuales gracefully.',
                        },
                        {
                          r: 'Latencia y Costo del LLM',
                          hu: 'HU-04',
                          l: 'Alto',
                          m: 'Pruebas unitarias de timeouts, reintentos exponenciales y mocks de fallback local.',
                        },
                        {
                          r: 'Precisión de Extracción de Tareas',
                          hu: 'HU-04',
                          l: 'Alto',
                          m: 'Flujo interactivo con validación y edición obligatoria humana en formulario antes de guardar.',
                        },
                        {
                          r: 'Entorno de Despliegue Indefinido',
                          hu: 'HU-05',
                          l: 'Medio',
                          m: 'Tests de integración agnósticos a BD usando interfaz de persistencia localStorage / SQLite.',
                        },
                        {
                          r: 'Pérdida de datos en fallos de guardado',
                          hu: 'HU-05',
                          l: 'Medio',
                          m: 'Test unitario de excepción controlada: almacenamiento no se vacía si falla la BD.',
                        },
                        {
                          r: 'Complejidad diarización (voces)',
                          hu: 'HU-03',
                          l: 'Bajo',
                          m: 'Solución timeboxed opcional con retroalimentación e iteración constante junto al cliente.',
                        },
                      ].map((item, index) => (
                        <tr key={index} className="hover:bg-zinc-800/10">
                          <td className="py-2.5 font-semibold text-zinc-200">{item.r}</td>
                          <td className="py-2.5 font-mono text-zinc-400">{item.hu}</td>
                          <td className="py-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                                item.l === 'Alto'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                                  : item.l === 'Medio'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                              }`}
                            >
                              {item.l}
                            </span>
                          </td>
                          <td className="py-2.5 text-zinc-400 leading-normal">{item.m}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: tools, done, timeline */}
            <div className="lg:col-span-1 space-y-6">
              {/* Mock Test Suite Runner Console */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/35 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-200">Consola de Vitest</h3>
                  <button
                    onClick={runTests}
                    disabled={testState === 'running'}
                    className={`px-3 py-1.5 text-xs font-semibold rounded shadow-md transition-all cursor-pointer ${
                      testState === 'running'
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/10'
                    }`}
                  >
                    {testState === 'running' ? 'Ejecutando...' : 'Ejecutar Suite'}
                  </button>
                </div>

                <div className="rounded-lg bg-black border border-zinc-850 p-4 h-64 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 text-zinc-500 shadow-inner">
                  {consoleLogs.map((log, idx) => {
                    let colorClass = 'text-zinc-400';
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
                      colorClass = 'text-zinc-600';
                    }
                    return (
                      <div key={idx} className={colorClass}>
                        {log}
                      </div>
                    );
                  })}

                  {consoleLogs.length === 0 && testState === 'idle' && (
                    <div className="text-zinc-700 italic h-full flex items-center justify-center text-center">
                      Simular ejecución continua de pruebas TDD.
                    </div>
                  )}
                </div>
              </div>

              {/* Responsabilidades de Prueba (XP Roles) */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3.5">
                <h3 className="text-sm font-semibold text-zinc-200">Responsabilidades de Prueba</h3>
                <div className="space-y-3 text-xs">
                  {[
                    {
                      role: 'Programador (Kevin / Jhonathan)',
                      duty: 'Escribir tests unitarios (TDD) automáticos antes de tirar código de negocio.',
                    },
                    {
                      role: 'Tester (Kevin / Jhonathan)',
                      duty: 'Diseñar especificaciones Playwright E2E y ejecutar planes de integración.',
                    },
                    {
                      role: 'Cliente (Ariel Rosas)',
                      duty: 'Validar criterios de aceptación reuniéndose con el equipo y aportando feedback.',
                    },
                    {
                      role: 'Tracker (Santiago Pinta)',
                      duty: 'Monitorear métricas de cobertura, reportar fallas e informar de riesgos.',
                    },
                  ].map((item, k) => (
                    <div
                      key={k}
                      className="space-y-1 bg-zinc-950/20 p-2.5 rounded border border-zinc-850/60 leading-normal"
                    >
                      <span className="block font-semibold text-zinc-300 font-mono text-[10.5px]">{item.role}</span>
                      <p className="text-[11px] text-zinc-400 font-sans">{item.duty}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Definition of Done */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3.5">
                <h3 className="text-sm font-semibold text-zinc-200">Definición de "Listo" (DOD)</h3>
                <div className="space-y-2">
                  {doneChecklistItems.map((item, index) => {
                    // Simulating checked if stories are mostly complete
                    const isCompleted = index !== 1 && index !== 3; // mock
                    return (
                      <div key={index} className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-400">
                        <span
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'border-zinc-800 text-transparent'
                          }`}
                        >
                          {isCompleted ? '✓' : ''}
                        </span>
                        <span className={isCompleted ? 'text-zinc-300' : 'text-zinc-500'}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Herramientas de Prueba */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3.5">
                <h3 className="text-sm font-semibold text-zinc-200">Herramientas</h3>
                <div className="space-y-2 text-xs font-mono text-zinc-300">
                  <div className="flex justify-between bg-zinc-950/40 p-2 rounded border border-zinc-850">
                    <span className="text-zinc-400">Unitarias:</span>
                    <strong className="text-indigo-400">Vitest</strong>
                  </div>
                  <div className="flex justify-between bg-zinc-950/40 p-2 rounded border border-zinc-850">
                    <span className="text-zinc-400">Funcionales E2E:</span>
                    <strong className="text-emerald-400">Playwright</strong>
                  </div>
                  <div className="flex justify-between bg-zinc-950/40 p-2 rounded border border-zinc-850">
                    <span className="text-zinc-400">Integración:</span>
                    <strong className="text-amber-400">Vitest</strong>
                  </div>
                  <div className="flex justify-between bg-zinc-950/40 p-2 rounded border border-zinc-850">
                    <span className="text-zinc-400">Cobertura:</span>
                    <strong className="text-zinc-300">Istanbul / c8</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pruebas Funcionales E2E */}
      {activeTab === 'e2e' && (
        <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Pruebas Funcionales E2E (Playwright Specs)</h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              Casos de prueba automatizados agrupados por historias de usuario
            </p>
          </div>

          <div className="space-y-4">
            {stories.map((story) => {
              const isExpanded = expandedE2EStoryId === story.id;
              const casesKeys = Object.keys(e2eCodes).filter(
                (k) => k.startsWith(`TC-0${story.id.split('-')[1]}`) || (story.id === 'hu-03' && k.startsWith('TC-03')),
              );
              const totalCases = casesKeys.length;
              if (totalCases === 0) return null;

              return (
                <div key={story.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                  {/* Suite Accordion Trigger */}
                  <button
                    onClick={() => setExpandedE2EStoryId(isExpanded ? null : story.id)}
                    className="w-full px-5 py-3.5 flex items-center justify-between text-left focus:outline-none bg-zinc-950/40 cursor-pointer hover:bg-zinc-950/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {story.id.toUpperCase()}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-200">{story.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                      <span>{totalCases} tests</span>
                      <span>{story.id === 'hu-03' ? 'Opcional' : 'Core'}</span>
                      <span>{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 text-[10px] font-mono text-zinc-500 uppercase">
                            <th className="py-2 px-2">Código</th>
                            <th className="py-2 px-2">Descripción del Caso de Prueba</th>
                            <th className="py-2 px-2 text-center w-24">Estado</th>
                            <th className="py-2 px-2 text-right w-24">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850 text-zinc-300 font-sans">
                          {casesKeys.map((code) => {
                            const desc =
                              code === 'TC-01.1'
                                ? 'Botón Iniciar Reunión visible al cargar'
                                : code === 'TC-01.2'
                                  ? 'Solicitud de permisos de micrófono al iniciar'
                                  : code === 'TC-01.3'
                                    ? 'Indicador visual de sesión activa'
                                    : code === 'TC-01.4'
                                      ? 'Botón Finalizar visible durante sesión activa'
                                      : code === 'TC-01.5'
                                        ? 'Sesión se cierra al presionar Finalizar'
                                        : code === 'TC-01.6'
                                          ? 'No se puede Finalizar si no hay sesión activa'
                                          : code === 'TC-02.1'
                                            ? 'Texto aparece en pantalla segundos después de hablar'
                                            : code === 'TC-02.2'
                                              ? 'Texto en orden cronológico ascendente'
                                              : code === 'TC-02.3'
                                                ? 'Área de transcripción es desplazable (scroll)'
                                                : code === 'TC-02.4'
                                                  ? 'Transcripción se detiene al finalizar'
                                                  : code === 'TC-02.5'
                                                    ? 'Sistema funciona en Chrome'
                                                    : code === 'TC-03.1'
                                                      ? 'Sistema asigna etiquetas diferentes a hablantes'
                                                      : code === 'TC-03.2'
                                                        ? 'Misma persona mantiene etiqueta consistente'
                                                        : code === 'TC-04.1'
                                                          ? 'Indicador de "Procesando..." mientras espera respuesta LLM'
                                                          : code === 'TC-04.2'
                                                            ? 'Resumen muestra tareas con campos correctos'
                                                            : code === 'TC-04.3'
                                                              ? 'Usuario puede editar campo de tarea'
                                                              : code === 'TC-04.4'
                                                                ? 'Usuario puede agregar tarea manual'
                                                                : code === 'TC-04.5'
                                                                  ? 'Usuario puede eliminar tarea del resumen'
                                                                  : code === 'TC-04.6'
                                                                    ? 'Al presionar Confirmar, ítems pasan al guardado'
                                                                    : code === 'TC-05.1'
                                                                      ? 'Tareas aparecen inmediatamente en dashboard tras confirmar'
                                                                      : code === 'TC-06.1'
                                                                        ? 'Tareas ordenadas por fecha ascendente'
                                                                        : code === 'TC-06.2'
                                                                          ? 'Tareas sin fecha aparecen al final'
                                                                          : code === 'TC-06.3'
                                                                            ? 'Cambios de estado persisten tras recarga'
                                                                            : code === 'TC-07.1'
                                                                              ? 'Observaciones distinguidas de tareas'
                                                                              : code === 'TC-07.2'
                                                                                ? 'Observaciones accesibles desde sección dedicada'
                                                                                : 'Observaciones no aparecen en panel de tareas';

                            const isPassing =
                              story.status === 'Done' || (story.status === 'Current' && code !== 'TC-07.3'); // mock diarization and 7.3

                            return (
                              <tr key={code} className="hover:bg-zinc-800/10">
                                <td className="py-2.5 px-2 font-mono font-bold text-zinc-400">{code}</td>
                                <td className="py-2.5 px-2 text-zinc-300 font-medium">{desc}</td>
                                <td className="py-2.5 px-2 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                                      isPassing
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                    }`}
                                  >
                                    {isPassing ? 'Pasando ✓' : 'Pendiente'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2 text-right">
                                  <button
                                    onClick={() =>
                                      handleOpenCode(
                                        `E2E: Caso de Prueba ${code}`,
                                        e2eCodes[code] || '',
                                        `npm run test:e2e-grep "${code}"`,
                                      )
                                    }
                                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all font-mono text-[9.5px] cursor-pointer"
                                  >
                                    Ver código
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom command panel */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4.5 space-y-3">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold block">
              Ejecución Manual de Pruebas E2E
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-black/40 border border-zinc-850 p-3 rounded-lg font-mono text-xs text-zinc-300">
              <code>npx playwright test --project=chromium --grep "HU-01"</code>
              <button
                onClick={() => handleCopyToClipboard('npx playwright test --project=chromium')}
                className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-sans font-semibold text-[10px] cursor-pointer transition-colors"
              >
                Copiar Comando
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pruebas de Integración */}
      {activeTab === 'integration' && (
        <div className="space-y-6 animate-[fade-in_0.2s_ease-out]">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Pruebas de Integración (Vitest Integration Specs)</h3>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              Escenarios de validación modular conjunta del secretario inteligente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'INT-01',
                title: 'INT-01: Audio ──► Transcripción',
                casesCount: 3,
                modules: 'SesionReunion, Transcripcion',
                desc: 'Validar que el audio capturado se encadena correctamente con el speech recognition y se acumula cronológicamente.',
              },
              {
                id: 'INT-02',
                title: 'INT-02: Transcripción ──► LLM ──► BD',
                casesCount: 4,
                modules: 'Transcripcion, ExtractorLLM, RepositorioTareas',
                desc: 'Validar que el prompt de extracción reciba la transcripción, el LLM procese sin errores y persista en BD local.',
              },
              {
                id: 'INT-03',
                title: 'INT-03: BD ──► Dashboard ──► UI',
                casesCount: 4,
                modules: 'RepositorioTareas, Dashboard',
                desc: 'Validar que los datos insertados aparezcan de inmediato ordenados, y sus cambios de completado persistan.',
              },
              {
                id: 'INT-04',
                title: 'INT-04: LLM Clasificación ──► Almacenamiento Separado',
                casesCount: 4,
                modules: 'Clasificador, RepositorioTareas',
                desc: 'Validar que el Clasificador separe compromisos de observaciones y los persista en tablas separadas en la base de datos.',
              },
              {
                id: 'INT-05',
                title: 'INT-05: Aislamiento de Múltiples Reuniones',
                casesCount: 4,
                modules: 'SesionReunion, Dashboard',
                desc: 'Validar que múltiples juntas guarden un aislamiento absoluto en BD, mostrando tareas unificadas pero observaciones aisladas.',
              },
            ].map((sc) => {
              const isExpanded = expandedIntScenarioId === sc.id;
              const scenarioCases = Object.keys(integrationCodes).filter((k) => k.startsWith(sc.id));

              return (
                <div
                  key={sc.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden md:col-span-1"
                >
                  <button
                    onClick={() => setExpandedIntScenarioId(isExpanded ? null : sc.id)}
                    className="w-full px-4.5 py-3.5 flex items-center justify-between text-left focus:outline-none bg-zinc-950/40 cursor-pointer hover:bg-zinc-950/70 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">{sc.title}</h4>
                      <span className="text-[9px] font-mono text-zinc-500 mt-1 block">Módulos: {sc.modules}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                      {sc.casesCount} tests
                      <span>{isExpanded ? '▲' : '▼'}</span>
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{sc.desc}</p>

                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800 text-[9px] font-mono text-zinc-500 uppercase">
                            <th className="py-2">Código</th>
                            <th className="py-2">Objetivo</th>
                            <th className="py-2 text-center w-20">Estado</th>
                            <th className="py-2 text-right w-20">Código</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850 text-zinc-300 font-sans">
                          {scenarioCases.map((code) => {
                            const caseGoal =
                              code === 'INT-01.1'
                                ? 'Audio se captura, transcribe y persiste correctamente'
                                : code === 'INT-01.2'
                                  ? 'Múltiples fragmentos se ordenan cronológicamente'
                                  : code === 'INT-01.3'
                                    ? 'Error en captura de audio no corrompe transcripción'
                                    : code === 'INT-02.1'
                                      ? 'Transcripción completa se envía al LLM correctamente'
                                      : code === 'INT-02.2'
                                        ? 'Tareas extraídas se guardan en BD'
                                        : code === 'INT-02.3'
                                          ? 'No se guardan tareas duplicadas'
                                          : code === 'INT-02.4'
                                            ? 'Error en LLM no pierde datos de transcripción'
                                            : code === 'INT-03.1'
                                              ? 'Tareas guardadas aparecen de inmediato en dashboard'
                                              : code === 'INT-03.2'
                                                ? 'Tareas se ordenan por fecha en dashboard'
                                                : code === 'INT-03.3'
                                                  ? 'Marcar como completada persiste'
                                                  : code === 'INT-03.4'
                                                    ? 'Recargar página no pierde datos'
                                                    : code === 'INT-04.1'
                                                      ? 'Items se clasifican como tarea u observación'
                                                      : code === 'INT-04.2'
                                                        ? 'Tareas y observaciones en tablas separadas'
                                                        : code === 'INT-04.3'
                                                          ? 'Observaciones no aparecen en dashboard tareas'
                                                          : code === 'INT-04.4'
                                                            ? 'Observaciones filtradas por sesión/reunión'
                                                            : code === 'INT-05.1'
                                                              ? 'Múltiples reuniones aisladas correctamente'
                                                              : code === 'INT-05.2'
                                                                ? 'Dashboard muestra todas las tareas ordenadas'
                                                                : code === 'INT-05.3'
                                                                  ? 'Observaciones vinculadas a su reunión origen'
                                                                  : 'Completar tarea de reunión no afecta otras';

                            const isPassing = testState === 'completed' || code !== 'INT-05.4'; // mock pending state

                            return (
                              <tr key={code} className="hover:bg-zinc-800/10">
                                <td className="py-2 font-mono font-bold text-zinc-400">{code}</td>
                                <td className="py-2 text-zinc-300 font-medium">{caseGoal}</td>
                                <td className="py-2 text-center">
                                  <span
                                    className={`px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold ${
                                      isPassing
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                                    }`}
                                  >
                                    {isPassing ? 'Pasando' : 'Pendiente'}
                                  </span>
                                </td>
                                <td className="py-2 text-right">
                                  <button
                                    onClick={() =>
                                      handleOpenCode(
                                        `Integración: Caso ${code}`,
                                        integrationCodes[code] || '',
                                        `npm run test:integration-grep "${code}"`,
                                      )
                                    }
                                    className="px-1.5 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 transition-all font-mono text-[9px] cursor-pointer"
                                  >
                                    Ver
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Key Data Validation Checklist */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Validación de Datos Clave de Integración</h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                Integridad referencial y resguardo en ciclos combinados
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-400">
              {[
                'Las tareas guardadas tienen asignada la llave a la reunión de origen.',
                'El panel excluye las observaciones del listado principal.',
                'Los datos modificados en el resumen no corrompen campos originales.',
                'Timestamps de creación asignados automáticamente en base de datos.',
                'Llamada de LLM mockeada de forma local con datos del seed canónicos.',
                'Las fechas nulas o vacías se ordenan al final del listado.',
                'Identificadores de diarización se conservan sin mezclarse entre bloques.',
                'El estado completado tacha la tarea y se almacena en localStorage.',
                'Bifurcación de tareas y observaciones aisladas en almacenamiento.',
              ].map((val, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded bg-zinc-950/40 border border-zinc-850">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Code Viewer Modal */}
      {codeModal && codeModal.isOpen && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl animate-[slide-up_0.2s_ease-out]">
            <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between flex-shrink-0 bg-zinc-950/40">
              <h3 className="text-sm font-bold text-zinc-200">{codeModal.title}</h3>
              <button
                onClick={() => setCodeModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 cursor-pointer"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </header>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-[11px] leading-relaxed text-zinc-300 bg-black/30">
              <pre className="p-4 rounded-lg bg-black border border-zinc-850 overflow-x-auto whitespace-pre-wrap select-text">
                {codeModal.code}
              </pre>
            </div>

            <footer className="px-6 py-4.5 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0 bg-zinc-950/20">
              <div className="text-[10px] font-mono text-zinc-500">
                Ejecución: <code className="text-indigo-400 font-semibold">{codeModal.cmd}</code>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyToClipboard(codeModal.code)}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold shadow-md shadow-indigo-500/10 cursor-pointer transition-colors"
                >
                  {copySuccess ? '¡Copiado! ✓' : 'Copiar Código'}
                </button>
                <button
                  onClick={() => setCodeModal(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-sans text-xs font-semibold cursor-pointer border border-zinc-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

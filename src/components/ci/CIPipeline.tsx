import { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { $runtimeStories } from '../../store/stories';
import { $runtimeLogs } from '../../store/logs';

interface BuildRecord {
  buildNumber: number;
  time: string;
  status: 'Passed' | 'Failed';
  duration: string;
  triggeredBy: string;
  reason?: string;
}

export default function CIPipeline() {
  const stories = useStore($runtimeStories);
  const logs = useStore($runtimeLogs);

  // States
  const [pipelineState, setPipelineState] = useState<
    'idle' | 'linting' | 'testing' | 'building' | 'releasing' | 'success' | 'failed'
  >('idle');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [builds, setBuilds] = useState<BuildRecord[]>([
    { buildNumber: 3, time: '22/5/2026, 00:45:00', status: 'Passed', duration: '9.2s', triggeredBy: 'David Kim' },
    { buildNumber: 2, time: '21/5/2026, 20:30:12', status: 'Passed', duration: '8.7s', triggeredBy: 'Carol Wu' },
    { buildNumber: 1, time: '21/5/2026, 10:14:45', status: 'Passed', duration: '10.1s', triggeredBy: 'Carol Wu' },
  ]);

  // Compute stats for Quality Lock
  const stats = useMemo(() => {
    const targetStories = stories.filter((s) => s.status === 'Current' || s.status === 'Done');
    const tddCount = targetStories.filter((s) => s.isTDD).length;
    const tddRate = targetStories.length > 0 ? Math.round((tddCount / targetStories.length) * 100) : 100;

    const openDebts = logs.filter((l) => (l.type === 'debt' || l.type === 'refactor') && l.status === 'Open');
    const hasHighPriorityDebt = openDebts.some(
      (d) => d.title.toLowerCase().includes('card') || d.title.toLowerCase().includes('shared'),
    );

    return { tddRate, hasHighPriorityDebt, openDebtsCount: openDebts.length };
  }, [stories, logs]);

  const triggerPipeline = () => {
    if (pipelineState !== 'idle' && pipelineState !== 'success' && pipelineState !== 'failed') return;

    setPipelineState('linting');
    setConsoleOutput([
      '📦 Iniciando compilación de pipeline de CI #' + (builds.length + 1) + '...',
      '🐳 Iniciando contenedor virtual...',
    ]);

    // Schedule stages
    setTimeout(() => {
      // Step 1: LINTING
      setConsoleOutput((prev) => [
        ...prev,
        '⚙️  ETAPAS: VALIDACIÓN (LINT)',
        '   Ejecutando auditoría de estándares de Prettier...',
        '   Ejecutando verificación de reglas de ESLint...',
        '   ✓ No se encontraron discrepancias de formato.',
      ]);
      setPipelineState('testing');

      setTimeout(() => {
        // Step 2: TESTING (XP QUALITY LOCK)
        setConsoleOutput((prev) => [
          ...prev,
          '⚙️  ETAPAS: PRUEBAS (TEST)',
          '   Resolviendo ejecutores de pruebas...',
          '   Ejecutando 14 suites de pruebas unitarias y de aceptación...',
        ]);

        // Check if build fails due to XP standards
        const tddFails = stats.tddRate < 50;
        const debtFails = stats.hasHighPriorityDebt;

        if (tddFails || debtFails) {
          setTimeout(() => {
            let errorMsg = '';
            if (tddFails) {
              errorMsg = `Error: Pipeline abortado. El cumplimiento de la Tasa de TDD está por debajo del umbral (${stats.tddRate}% vs 50% requerido). Se rechaza compilar código sin pruebas de respaldo.`;
            } else {
              errorMsg =
                'Error: El elemento de Deuda Técnica de alta prioridad "Extract shared card styles" está sin resolver. Bloqueo de seguridad del pipeline activado.';
            }

            setConsoleOutput((prev) => [
              ...prev,
              '❌ ETAPA DE PRUEBAS FALLIDA',
              `   Tasa de TDD: ${stats.tddRate}%`,
              `   Deuda de Alta Prioridad: ${stats.hasHighPriorityDebt ? 'Sin resolver' : 'Limpia'}`,
              errorMsg,
              '⛔ COMPILACIÓN ABORTADA.',
            ]);
            setPipelineState('failed');

            // Record fail
            setBuilds((prev) => [
              {
                buildNumber: prev.length + 1,
                time: new Date().toLocaleString('es-419'),
                status: 'Failed',
                duration: '4.8s',
                triggeredBy: 'XP Bot',
                reason: tddFails ? 'Baja cobertura de TDD' : 'Deuda técnica de alta prioridad',
              },
              ...prev,
            ]);
          }, 1200);
        } else {
          // Continuous Testing succeeds
          setTimeout(() => {
            setConsoleOutput((prev) => [
              ...prev,
              '   ✓ stories.test.ts aprobado',
              '   ✓ pairSession.test.ts aprobado',
              '   ✓ 14/14 especificaciones de prueba verificadas',
              '   ✓ ¡Listas de verificación de aceptación conformes!',
            ]);
            setPipelineState('building');

            setTimeout(() => {
              // Step 3: BUILDING
              setConsoleOutput((prev) => [
                ...prev,
                '⚙️  ETAPAS: COMPILACIÓN (BUILD)',
                '   Ejecutando compilación estática `npm run build`...',
                '   Comprimiendo tokens de estilo...',
                '   Compilando layouts de páginas de Astro...',
                '   ✓ Paquete de compilación de Astro completado (14 páginas generadas)',
              ]);
              setPipelineState('releasing');

              setTimeout(() => {
                // Step 4: RELEASING
                setConsoleOutput((prev) => [
                  ...prev,
                  '⚙️  ETAPAS: LIBERACIÓN (RELEASE)',
                  '   Subiendo distribución estática de producción al proxy CDN local...',
                  '   Actualizando hashes estáticos de IPFS...',
                  '   ✓ Compilación de liberación desplegada y en línea en preview.xpflow.local',
                  '🎉 COMPILACIÓN EXITOSA.',
                ]);
                setPipelineState('success');

                // Record success
                setBuilds((prev) => [
                  {
                    buildNumber: prev.length + 1,
                    time: new Date().toLocaleString('es-419'),
                    status: 'Passed',
                    duration: '8.4s',
                    triggeredBy: 'XP Bot',
                  },
                  ...prev,
                ]);
              }, 1500);
            }, 1500);
          }, 1500);
        }
      }, 1500);
    }, 1200);
  };

  const statusTranslations = {
    Passed: 'Exitoso',
    Failed: 'Fallido',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100">Motor de Integración Continua</h2>
          <p className="text-xs text-zinc-500 font-mono mt-1">Práctica XP: Integración Continua y Entregas Pequeñas</p>
        </div>
        <button
          onClick={triggerPipeline}
          disabled={pipelineState !== 'idle' && pipelineState !== 'success' && pipelineState !== 'failed'}
          className={`px-3 py-2 text-xs font-bold rounded shadow-lg transition-all cursor-pointer ${
            pipelineState !== 'idle' && pipelineState !== 'success' && pipelineState !== 'failed'
              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
              : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/10'
          }`}
        >
          {pipelineState !== 'idle' && pipelineState !== 'success' && pipelineState !== 'failed'
            ? 'Pipeline en ejecución...'
            : 'Iniciar Pipeline de CI'}
        </button>
      </div>

      {/* Visual Pipeline flow chart */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-6 space-y-6">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-medium block">Etapas de Compilación</h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 max-w-4xl mx-auto relative px-8">
          {/* Connector Line in Background */}
          <div className="absolute top-[21px] left-16 right-16 h-0.5 bg-zinc-800 -z-10 hidden md:block" />

          {/* Stage 1: LINT */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all ${
                pipelineState === 'linting'
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 animate-pulse'
                  : pipelineState !== 'idle'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
              }`}
            >
              LNT
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Validación (Lint)</span>
          </div>

          {/* Connector */}
          <span className="text-zinc-600 font-mono text-xs md:hidden">↓</span>

          {/* Stage 2: TEST */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all ${
                pipelineState === 'testing'
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 animate-pulse'
                  : pipelineState === 'failed'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-400'
                    : pipelineState === 'building' || pipelineState === 'releasing' || pipelineState === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
              }`}
            >
              PRB
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Pruebas (TDD)</span>
          </div>

          {/* Connector */}
          <span className="text-zinc-600 font-mono text-xs md:hidden">↓</span>

          {/* Stage 3: BUILD */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all ${
                pipelineState === 'building'
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 animate-pulse'
                  : pipelineState === 'releasing' || pipelineState === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
              }`}
            >
              CMP
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Compilación</span>
          </div>

          {/* Connector */}
          <span className="text-zinc-600 font-mono text-xs md:hidden">↓</span>

          {/* Stage 4: RELEASE */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div
              className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xs font-mono font-bold transition-all ${
                pipelineState === 'releasing'
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 animate-pulse'
                  : pipelineState === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
              }`}
            >
              LIB
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Despliegue</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Monospace build output */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">Salida de Consola del Pipeline</h3>
            <div className="rounded-lg bg-black border border-zinc-800 p-4 h-80 overflow-y-auto font-mono text-xs leading-relaxed space-y-1.5 text-zinc-400 shadow-inner">
              {consoleOutput.map((log, idx) => {
                let colorClass = 'text-zinc-300';
                if (
                  log.includes('✓') ||
                  log.includes('EXITOSA') ||
                  log.includes('aprobado') ||
                  log.includes('conformes')
                ) {
                  colorClass = 'text-emerald-400';
                } else if (
                  log.includes('❌') ||
                  log.includes('Error:') ||
                  log.includes('FALLIDA') ||
                  log.includes('⛔')
                ) {
                  colorClass = 'text-rose-400 font-semibold';
                } else if (log.includes('⚙️') || log.includes('⚙️  ETAPAS:')) {
                  colorClass = 'text-indigo-400 font-semibold';
                } else if (log.includes('⏳') || log.includes('🐳')) {
                  colorClass = 'text-zinc-500';
                }
                return (
                  <div key={idx} className={colorClass}>
                    {log}
                  </div>
                );
              })}

              {consoleOutput.length === 0 && (
                <div className="text-zinc-600 italic h-full flex items-center justify-center text-center">
                  Pipeline de CI inactivo. Inicie una compilación para ejecutar el ciclo de retroalimentación continua.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Build ledger and quality gauges */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quality check ledger */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">Umbrales de Calidad XP</h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
                <div>
                  <span className="text-xs font-semibold text-zinc-300">Cumplimiento de Tasa TDD</span>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Requerido: ≥ 50%</span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    stats.tddRate >= 50 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {stats.tddRate}%
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
                <div>
                  <span className="text-xs font-semibold text-zinc-300">Deuda técnica de alta prioridad</span>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Requerido: Resuelta</span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    !stats.hasHighPriorityDebt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {stats.hasHighPriorityDebt ? 'Sin resolver' : 'Limpia'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1">
                <div>
                  <span className="text-xs font-semibold text-zinc-300">Deuda técnica total pendiente</span>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">Óptimo: &lt; 5 registros</span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    stats.openDebtsCount < 5 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {stats.openDebtsCount} {stats.openDebtsCount === 1 ? 'registro' : 'registros'}
                </span>
              </div>
            </div>
          </div>

          {/* Build history ledger */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">Historial de Compilaciones</h3>
            <div className="divide-y divide-zinc-800/40 space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {builds.map((b) => (
                <div key={b.buildNumber} className="pt-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-zinc-200">
                      Compilación #{b.buildNumber}{' '}
                      <span
                        className={`text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded ${
                          b.status === 'Passed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {statusTranslations[b.status]}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">{b.time}</span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-zinc-500">
                    <span>{b.duration}</span>
                    <span className="block mt-0.5">{b.triggeredBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

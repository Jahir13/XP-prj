import { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import ErrorBoundary from '../ui/ErrorBoundary';

// 12 XP Practices Interfaces
interface Practice {
  id: string;
  name: string;
  category: 'Planning' | 'Development' | 'Quality' | 'Team';
  status: 'Implemented' | 'Simulated' | 'Missing';
  description: string;
  evidence: string;
  recommendation: string;
}

const XP_PRACTICES: Practice[] = [
  {
    id: 'planning-game',
    name: 'Juego de la Planeación',
    category: 'Planning',
    status: 'Implemented',
    description:
      'Los clientes y desarrolladores deciden juntos qué historias se incluirán en cada iteración basándose en estimaciones realistas y velocidad real.',
    evidence:
      'Historias de usuario completamente tipadas, estimaciones por puntos Fibonacci, y tablero de planificación de iteraciones con límites de capacidad y cálculo automático de velocidad.',
    recommendation:
      'Mantener la disciplina de limitar la carga de la iteración de acuerdo a la velocidad real medida del equipo.',
  },
  {
    id: 'small-releases',
    name: 'Entregas Pequeñas',
    category: 'Planning',
    status: 'Implemented',
    description:
      'Liberar versiones útiles del software a los usuarios finales de manera frecuente en iteraciones cortas.',
    evidence:
      'Estructuración del proyecto en iteraciones con fechas de inicio y fin definidas. Configuración del empaquetado de producción Astro SSR listo para despliegues incrementales rápidos.',
    recommendation:
      'Alinear los despliegues de producción automáticos al finalizar cada iteración una vez aprobados en E2E.',
  },
  {
    id: 'metaphor',
    name: 'Metáfora del Sistema',
    category: 'Planning',
    status: 'Simulated',
    description:
      'Una visión compartida de cómo funciona el sistema, guiando la arquitectura, la nomenclatura del código y el diseño global.',
    evidence:
      'Existen referencias de texto en los paneles ("The Card File" para el backlog y "wizard" para standups), pero no hay un mapeo documentado o vocabulario formal unificado en las clases o modelos del código.',
    recommendation:
      'Elaborar un glosario y mapa de arquitectura técnica oficial utilizando la analogía del "Archivero de Tarjetas Físicas" y asegurar que toda nueva entidad de código siga esta convención.',
  },
  {
    id: 'simple-design',
    name: 'Diseño Simple',
    category: 'Planning',
    status: 'Implemented',
    description:
      'El diseño del sistema debe ser el más simple posible para pasar todas las pruebas y satisfacer los requerimientos actuales.',
    evidence:
      'Componentes React modulares con responsabilidades únicas y separadas, layouts centralizados y eliminación de boilerplate innecesario de almacenamiento local.',
    recommendation:
      'Mantener la simplicidad evitando la sobre-ingeniería preventiva; diseñar solo para la historia que se está codificando.',
  },
  {
    id: 'testing',
    name: 'Pruebas Automatizadas',
    category: 'Quality',
    status: 'Implemented',
    description:
      'Tanto las pruebas unitarias (de programador) como las de aceptación (de cliente) deben ejecutarse continuamente.',
    evidence:
      '13 pruebas unitarias de Vitest exitosas cubriendo client/stores, y 5 pruebas de extremo a extremo (E2E) con Playwright en español cubriendo flujos de historias, planificación, login y standups.',
    recommendation:
      'Incrementar la cobertura de pruebas unitarias sobre componentes de UI React y configurar reportes automáticos de cobertura en el linter.',
  },
  {
    id: 'refactoring',
    name: 'Refactorización',
    category: 'Development',
    status: 'Implemented',
    description: 'Mejorar continuamente el diseño del código existente sin cambiar su comportamiento externo.',
    evidence:
      'Panel de control de Deuda Técnica integrado en el Dashboard que registra, prioriza y asocia deudas y refactorizaciones a historias de usuario específicas para su resolución sistemática.',
    recommendation:
      'Garantizar que en cada iteración se reserve entre un 10% y 15% de la velocidad del equipo para resolver deudas pendientes de alta prioridad.',
  },
  {
    id: 'pair-programming',
    name: 'Programación en Parejas',
    category: 'Development',
    status: 'Implemented',
    description:
      'Todo el código de producción es escrito por dos personas compartiendo un único ordenador, turnándose los roles de Conductor (Driver) y Navegador.',
    evidence:
      'Rastreador interactivo de parejas (Pair Tracker) en tiempo real con temporizador integrado, roles dinámicos, cambio de roles (Swap), historial persistente y exportación de sesiones a Markdown.',
    recommendation:
      'Rotar las parejas frecuentemente (por ejemplo, cada día o cada historia) para diseminar el conocimiento técnico de forma homogénea.',
  },
  {
    id: 'collective-ownership',
    name: 'Propiedad Colectiva',
    category: 'Development',
    status: 'Implemented',
    description:
      'Cualquier programador puede cambiar cualquier parte del código en cualquier momento para mejorar el diseño o corregir un fallo.',
    evidence:
      'La base de código está unificada con un único estándar de estilo de código estricto y tipados avanzados compartidos, facilitando la edición colectiva segura sin silos técnicos.',
    recommendation:
      'Fomentar que los desarrolladores de backend participen en parejas de frontend y viceversa para diluir las barreras de especialización.',
  },
  {
    id: 'continuous-integration',
    name: 'Integración Continua',
    category: 'Quality',
    status: 'Simulated',
    description:
      'Integrar y probar el código de forma colectiva varias veces al día. Cada integración debe ejecutarse y aprobar todas las pruebas.',
    evidence:
      'Existe una pestaña interactiva para CI/CD que simula de forma visual la consola de pruebas y el estado de compilación exitosa, pero no se encuentra conectada a un pipeline real (como GitHub Actions).',
    recommendation:
      'Integrar Playwright y Vitest en una GitHub Action que se dispare en cada Pull Request o Commit a la rama principal.',
  },
  {
    id: 'sustainable-pace',
    name: 'Paso Sostenible (40-Hour Week)',
    category: 'Team',
    status: 'Implemented',
    description:
      'El equipo debe trabajar a un ritmo que pueda sostener indefinidamente sin incurrir en agotamiento o fatiga extrema.',
    evidence:
      'Rastreador de ritmo en el módulo de equipo que establece una línea base semanal activa de 35 horas de asignación y alerta si el equipo excede su capacidad física recomendada.',
    recommendation:
      'Monitorear la fatiga del equipo durante las retrospectivas y ajustar el límite semanal si se observan cuellos de botella.',
  },
  {
    id: 'onsite-customer',
    name: 'Cliente en Sitio',
    category: 'Team',
    status: 'Simulated',
    description:
      'Un cliente real debe estar presente a tiempo completo para definir requerimientos, redactar pruebas de aceptación e iterar con el equipo.',
    evidence:
      'El flujo de historias incluye un filtro por rol "Responsable Cliente" y el módulo de miembros asigna el rol de Cliente a ciertos usuarios, pero las interacciones y criterios se simulan localmente.',
    recommendation:
      'Invitar formalmente al Product Owner del proyecto a realizar sesiones semanales de co-creación y validación de criterios directamente en la aplicación.',
  },
  {
    id: 'coding-standards',
    name: 'Estándares de Código',
    category: 'Development',
    status: 'Implemented',
    description:
      'Todo el código del proyecto debe seguir una convención unificada que priorice la claridad y la legibilidad.',
    evidence:
      'Estándares estrictos de formato y calidad forzados por Prettier y ESLint (con reglas avanzadas de accesibilidad web re-habilitadas) mediante pre-commit hooks integrados con Husky.',
    recommendation:
      'Revisar periódicamente las reglas del linter para ajustar la rigurosidad a medida que el equipo domine nuevas técnicas de programación limpia.',
  },
];

// XP core values angles & coordinates helpers
const CORE_VALUES = [
  {
    name: 'Comunicación',
    key: 'communication',
    value: 85,
    color: '#6366f1',
    desc: 'Fomenta el diálogo directo y abierto en standups diarios y programación en pareja.',
  },
  {
    name: 'Simplicidad',
    key: 'simplicity',
    value: 70,
    color: '#f59e0b',
    desc: 'Diseña solo para los requerimientos del presente, evitando sobre-ingeniería.',
  },
  {
    name: 'Retroalimentación',
    key: 'feedback',
    value: 90,
    color: '#10b981',
    desc: 'Garantiza ciclos de respuesta inmediatos con TDD, unit tests y validaciones.',
  },
  {
    name: 'Coraje',
    key: 'courage',
    value: 80,
    color: '#f43f5e',
    desc: 'Da confianza para refactorizar deuda técnica y tomar decisiones difíciles.',
  },
];

const getRadarPath = () => {
  const points = CORE_VALUES.map((cv, idx) => {
    const angle = (idx * Math.PI) / 2 - Math.PI / 2; // Start from top
    const r = (cv.value / 100) * 75;
    const x = 100 + r * Math.cos(angle);
    const y = 100 + r * Math.sin(angle);
    return `${x},${y}`;
  });
  return `M ${points.join(' L ')} Z`;
};

const getRadarPointCoords = (value: number, index: number) => {
  const angle = (index * Math.PI) / 2 - Math.PI / 2;
  const r = (value / 100) * 75;
  return {
    x: 100 + r * Math.cos(angle),
    y: 100 + r * Math.sin(angle),
  };
};

export default function XPComplianceDashboard() {
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null);
  const [activePhase, setActivePhase] = useState<'Planning' | 'Design' | 'Coding' | 'Testing'>('Planning');

  // Status mapping
  const statusBadges = {
    Implemented: { label: 'Implementado', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    Simulated: { label: 'Simulado', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    Missing: { label: 'Faltante', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  };

  const phaseArtifacts = {
    Planning: {
      title: 'Fase de Planeación',
      status: 'Excelente Cobertura',
      desc: 'Define las metas del proyecto y la estructura de las iteraciones rápidas en base al valor de negocio.',
      artifacts: [
        {
          name: 'Tablero de Historias de Usuario',
          found: true,
          details: 'Backlog dinámico de tarjetas con priorización.',
        },
        { name: 'Velocidad de Iteración', found: true, details: 'Límite de puntos por capacidad semanal.' },
        { name: 'Criterios de Aceptación', found: true, details: 'Listas de verificación integradas en cada tarjeta.' },
        {
          name: 'Metáfora del Sistema',
          found: false,
          details: 'Pendiente de formalizar terminología oficial en código.',
        },
      ],
    },
    Design: {
      title: 'Fase de Diseño',
      status: 'Buena Cobertura',
      desc: 'Establece arquitecturas simples e intuitivas que permiten la evolución fluida y el refactoring sin riesgos.',
      artifacts: [
        {
          name: 'Diseño Simple de Componentes',
          found: true,
          details: 'Módulos React puros enfocados en responsabilidades únicas.',
        },
        {
          name: 'Clases de Estilo Centralizadas',
          found: true,
          details: 'Configuración global de Tailwind v4 y variables CSS.',
        },
        {
          name: 'Glosario de Nombres Comunes',
          found: false,
          details: 'No se encontraron registros de vocabulario unificado.',
        },
      ],
    },
    Coding: {
      title: 'Fase de Codificación',
      status: 'Excelente Cobertura',
      desc: 'El proceso donde se construye el valor del software mediante la colaboración estrecha de los programadores.',
      artifacts: [
        {
          name: 'Rastreador de Programación en Pareja',
          found: true,
          details: 'Historial persistente y roles Driver/Navigator configurables.',
        },
        {
          name: 'Estándares de Formato',
          found: true,
          details: 'Prettier y linter forzados con Husky pre-commit hooks.',
        },
        {
          name: 'Bitácoras de Propiedad Colectiva',
          found: true,
          details: 'Registro de rotación y horas de parejas activas.',
        },
      ],
    },
    Testing: {
      title: 'Fase de Pruebas',
      status: 'Excelente Cobertura',
      desc: 'La red de seguridad indispensable que da confianza al equipo y garantiza la calidad constante sin fallos.',
      artifacts: [
        { name: 'Ciclo TDD Integrado', found: true, details: 'Flujo de validación unitaria paso a paso en dashboard.' },
        {
          name: 'Suite de Pruebas Unitarias (Vitest)',
          found: true,
          details: '13 pruebas automatizadas pasando con éxito.',
        },
        {
          name: 'Pruebas de Aceptación (Playwright)',
          found: true,
          details: '5 flujos E2E exitosos en español sin flakiness.',
        },
        {
          name: 'Pipeline CI Automatizado',
          found: false,
          details: 'Consola de pruebas simulada, requiere despliegue en GitHub.',
        },
      ],
    },
  };

  const selectedPhaseData = useMemo(() => phaseArtifacts[activePhase], [activePhase]);

  return (
    <ErrorBoundary>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">
                Mapeo de Cumplimiento Ágil
              </span>
              <h2 className="text-xl font-bold text-zinc-100">Estado de Adopción de Prácticas XP</h2>
              <p className="text-xs text-zinc-500 leading-normal max-w-xl">
                Evaluación integral de cumplimiento metodológico del software frente a la Programación Extrema (Extreme
                Programming). A continuación se visualizan las métricas basadas en la auditoría del proyecto.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-center">
                <span className="block text-[10px] font-mono text-zinc-500 uppercase">Prácticas Activas</span>
                <span className="block text-xl font-bold text-emerald-400 font-mono mt-0.5">9 / 12</span>
              </div>
              <div className="px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-center">
                <span className="block text-[10px] font-mono text-zinc-500 uppercase">Simuladas</span>
                <span className="block text-xl font-bold text-amber-400 font-mono mt-0.5">3 / 12</span>
              </div>
              <div className="px-4 py-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 text-center">
                <span className="block text-[10px] font-mono text-zinc-500 uppercase">Valores Core</span>
                <span className="block text-xl font-bold text-indigo-400 font-mono mt-0.5">81.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Layout: Core Values Radar Chart & Phase Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Spider Chart Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Mapeo de Valores Core de XP</h3>
              <p className="text-[10px] text-zinc-500 leading-normal font-mono mb-5">
                Cobertura porcentual ponderada de los 4 pilares fundamentales de la Programación Extrema.
              </p>
            </div>

            {/* SVG Radar Chart */}
            <div className="flex justify-center items-center py-2">
              <svg
                width="220"
                height="220"
                viewBox="0 0 200 200"
                className="overflow-visible"
                aria-label="Gráfico de radar que muestra la cobertura de los cuatro valores de XP: Comunicación 85%, Simplicidad 70%, Retroalimentación 90%, Coraje 80%."
              >
                {/* Radar Grid Circles */}
                {[25, 50, 75, 100].map((level) => (
                  <circle
                    key={level}
                    cx="100"
                    cy="100"
                    r={(level / 100) * 75}
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                ))}

                {/* Radar Grid Axis Lines */}
                {[0, 1, 2, 3].map((idx) => {
                  const angle = (idx * Math.PI) / 2 - Math.PI / 2;
                  const x2 = 100 + 75 * Math.cos(angle);
                  const y2 = 100 + 75 * Math.sin(angle);
                  return <line key={idx} x1="100" y1="100" x2={x2} y2={y2} stroke="#27272a" strokeWidth="1.5" />;
                })}

                {/* Radar Polygon Path (The Value Area) */}
                <path
                  d={getRadarPath()}
                  fill="url(#radarGradient)"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  className="animate-[fade-in_0.5s_ease-out]"
                />

                {/* Radar Interactive Nodes */}
                {CORE_VALUES.map((cv, idx) => {
                  const coords = getRadarPointCoords(cv.value, idx);
                  return (
                    <g key={cv.key} className="group cursor-pointer">
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="5.5"
                        fill="#09090b"
                        stroke={cv.color}
                        strokeWidth="2.5"
                        className="transition-transform duration-200 hover:scale-125"
                      />
                      {/* Tooltip Hover Area */}
                      <title>{`${cv.name}: ${cv.value}%`}</title>
                    </g>
                  );
                })}

                {/* Axis Labels */}
                {CORE_VALUES.map((cv, idx) => {
                  const angle = (idx * Math.PI) / 2 - Math.PI / 2;
                  const offset = 92; // Distance of label from center
                  const x = 100 + offset * Math.cos(angle);
                  const y = 100 + offset * Math.sin(angle);

                  // Alignment adjustments
                  let textAnchor: 'inherit' | 'middle' | 'start' | 'end' = 'middle';
                  let dy = '0.35em';
                  if (idx === 1) textAnchor = 'start';
                  if (idx === 3) textAnchor = 'end';

                  return (
                    <text
                      key={cv.key}
                      x={x}
                      y={y}
                      textAnchor={textAnchor}
                      dy={dy}
                      className="text-[9px] font-bold font-mono tracking-wider fill-zinc-400 uppercase"
                    >
                      {cv.name}
                    </text>
                  );
                })}

                {/* Gradients definitions */}
                <defs>
                  <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Values indicators list */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {CORE_VALUES.map((cv) => (
                <div
                  key={cv.key}
                  className="p-2 rounded-lg bg-zinc-950/40 border border-zinc-800/60 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cv.color }} />
                    <span className="text-[10px] font-semibold text-zinc-400">{cv.name}</span>
                  </div>
                  <span className="block text-sm font-bold font-mono text-zinc-100 mt-0.5">{cv.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Phase Strip Card */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">Mapeo del Ciclo de Vida Metodológico</h3>
              <p className="text-[10px] text-zinc-500 leading-normal font-mono mb-5">
                Seguimiento de artefactos encontrados en cada una de las 4 fases de la metodología XP.
              </p>
            </div>

            {/* Timeline phase selector tabs */}
            <div className="relative flex items-center justify-between gap-1 p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/80 mb-5">
              {(['Planning', 'Design', 'Coding', 'Testing'] as const).map((phase) => {
                const isActive = activePhase === phase;
                const phaseLabels = {
                  Planning: 'Planeación',
                  Design: 'Diseño',
                  Coding: 'Codificación',
                  Testing: 'Pruebas',
                };
                return (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => setActivePhase(phase)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 text-indigo-400 font-bold border border-zinc-700/50'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {phaseLabels[phase]}
                  </button>
                );
              })}
            </div>

            {/* Selected Phase Details */}
            <div className="flex-1 p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/60 space-y-4 animate-[fade-in_0.3s_ease-out]">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">{selectedPhaseData.title}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  {selectedPhaseData.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-mono">{selectedPhaseData.desc}</p>

              {/* Artifacts Found list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {selectedPhaseData.artifacts.map((art) => (
                  <div
                    key={art.name}
                    className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-start gap-2.5 hover:border-zinc-700/50 transition-colors"
                  >
                    <span
                      className={`w-4.5 h-4.5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                        art.found
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {art.found ? '✓' : '✗'}
                    </span>
                    <div>
                      <span className="block text-xs font-semibold text-zinc-300 leading-tight">{art.name}</span>
                      <span className="block text-[10px] text-zinc-500 font-mono mt-0.5 leading-normal">
                        {art.details}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Practices grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">Cuadrícula de las 12 Prácticas XP</h3>
              <p className="text-[10px] text-zinc-500 leading-normal font-mono">
                Haz clic en cualquier práctica para ver la evidencia detallada encontrada y recomendaciones.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {XP_PRACTICES.map((p) => {
              const bg = statusBadges[p.status];
              const categoryLabels = {
                Planning: 'Planeación',
                Development: 'Desarrollo',
                Quality: 'Calidad',
                Team: 'Equipo',
              };

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPractice(p)}
                  className="w-full text-left group p-4.5 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl hover:border-zinc-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer animate-[fade-in_0.3s_ease-out] relative"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
                      {categoryLabels[p.category]}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${bg.color}`}>
                      {bg.label}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">{p.name}</h4>
                  <p className="text-[10px] text-zinc-500 mt-2 line-clamp-2 leading-relaxed font-mono">
                    {p.description}
                  </p>

                  <div className="mt-3.5 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[9px] text-indigo-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ver Detalles</span>
                    <span>→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Gaps Panel */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Panel de Brechas y Áreas de Mejora</h3>
            <p className="text-[10px] text-zinc-500 leading-normal font-mono">
              Hallazgos críticos donde el cumplimiento de la metodología XP requiere mejoras o formalizaciones
              sistemáticas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                  Evidencia Faltante o Placeholder
                </h4>
              </div>
              <ul className="space-y-2.5 font-mono text-[10px] text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <div>
                    <strong className="text-zinc-300 block">Pipeline CI Real no Conectado:</strong>
                    La consola de pruebas simula compilaciones locales en vez de gatillar runners y builds reales en
                    nube.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <div>
                    <strong className="text-zinc-300 block">Metáfora no Documentada:</strong>
                    La nomenclatura del código no comparte la terminología formal de la metáfora ("El Archivero").
                  </div>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Prácticas Simuladas (Acciones Requeridas)
                </h4>
              </div>
              <ul className="space-y-2.5 font-mono text-[10px] text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <div>
                    <strong className="text-zinc-300 block">Pruebas de Aceptación Manuales:</strong>
                    Los criterios se marcan manualmente por desarrolladores en vez de ser validados por clientes en
                    sesiones dedicadas.
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <div>
                    <strong className="text-zinc-300 block">Cliente Remoto:</strong>
                    El rol del Cliente no se encuentra activamente integrado a tiempo completo en el equipo.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Accessible details modal for selected practices */}
        <Modal
          isOpen={selectedPractice !== null}
          onClose={() => setSelectedPractice(null)}
          title={selectedPractice?.name || 'Detalles de la Práctica'}
          size="md"
        >
          {selectedPractice && (
            <div className="space-y-4 text-zinc-300">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Descripción</span>
                <p className="text-xs text-zinc-200 mt-1 leading-relaxed font-mono">{selectedPractice.description}</p>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block font-semibold">
                  Evidencia Técnica Encontrada
                </span>
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-mono">{selectedPractice.evidence}</p>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-semibold">
                  Recomendaciones del Coach
                </span>
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-mono">
                  {selectedPractice.recommendation}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPractice(null)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ErrorBoundary>
  );
}
